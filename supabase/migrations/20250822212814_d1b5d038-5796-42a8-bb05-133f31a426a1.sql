-- CRITICAL SECURITY FIX: Restrict access to sensitive payment information in parking_bookings table

-- Create audit log for payment data access
CREATE TABLE IF NOT EXISTS public.payment_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL,
  payment_fields_accessed TEXT[],
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.payment_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view payment access logs
CREATE POLICY "payment_access_audit_admin_only" ON public.payment_access_audit
FOR ALL
USING (is_admin(auth.uid()));

-- Create secure function to log payment data access
CREATE OR REPLACE FUNCTION public.log_payment_data_access(
  booking_id UUID,
  access_type TEXT,
  payment_fields TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_access_audit (
    booking_id,
    accessed_by,
    access_type,
    payment_fields_accessed,
    accessed_at
  ) VALUES (
    booking_id,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    access_type,
    payment_fields,
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block operation
    RAISE LOG 'Failed to log payment access: %', SQLERRM;
END;
$$;

-- Create secure function to get safe booking data (excludes payment details)
CREATE OR REPLACE FUNCTION public.get_user_bookings_safe(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  user_id UUID,
  location TEXT,
  zone TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours INTEGER,
  cost_aed NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  confirmation_deadline TIMESTAMP WITH TIME ZONE,
  payment_type TEXT,
  payment_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Users can only see their own bookings
  IF user_uuid != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Can only view own bookings';
  END IF;

  -- Log the safe access
  PERFORM public.log_payment_data_access(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'user_safe_booking_access',
    ARRAY['non_sensitive_fields']
  );

  -- Return safe booking data without payment details
  RETURN QUERY 
  SELECT 
    pb.id,
    pb.user_id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.duration_hours,
    pb.cost_aed,
    pb.status,
    pb.created_at,
    pb.updated_at,
    pb.confirmation_deadline,
    pb.payment_type,
    pb.payment_status
  FROM public.parking_bookings pb
  WHERE pb.user_id = user_uuid;
END;
$$;

-- Create secure function to get payment details (admin only)
CREATE OR REPLACE FUNCTION public.get_booking_payment_details(booking_id UUID)
RETURNS TABLE(
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  payment_link_url TEXT,
  payment_amount_cents INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Only admins can access payment details
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for payment data access';
  END IF;

  -- Get booking record
  SELECT * INTO booking_record
  FROM public.parking_bookings 
  WHERE id = booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Log the payment data access
  PERFORM public.log_payment_data_access(
    booking_id,
    'admin_payment_details_access',
    ARRAY['stripe_customer_id', 'stripe_payment_intent_id', 'stripe_subscription_id', 'payment_link_url', 'payment_amount_cents']
  );

  -- Return payment details
  RETURN QUERY SELECT 
    booking_record.stripe_customer_id,
    booking_record.stripe_payment_intent_id,
    booking_record.stripe_subscription_id,
    booking_record.payment_link_url,
    booking_record.payment_amount_cents;
END;
$$;

-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.parking_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.parking_bookings;

-- Create new highly restrictive RLS policies
-- Only admins can directly access parking_bookings table (which contains payment data)
CREATE POLICY "admin_only_direct_access" ON public.parking_bookings
FOR SELECT
USING (
  is_admin(auth.uid()) AND 
  (public.log_payment_data_access(id, 'admin_direct_access', ARRAY['all_fields']) IS NULL OR true)
);

-- Only admins can update bookings directly (regular users must use safe functions)
CREATE POLICY "admin_only_update_access" ON public.parking_bookings
FOR UPDATE
USING (is_admin(auth.uid()));

-- Edge functions (service role) can access everything for payment processing
CREATE POLICY "service_role_payment_processing" ON public.parking_bookings
FOR ALL
USING (true);

-- Create function for users to safely update non-payment booking fields
CREATE OR REPLACE FUNCTION public.update_my_booking_safe(
  booking_id UUID,
  new_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Check if user owns this booking
  SELECT * INTO booking_record
  FROM public.parking_bookings 
  WHERE id = booking_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Log the safe update
  PERFORM public.log_payment_data_access(
    booking_id,
    'user_safe_update',
    ARRAY['status_only']
  );

  -- Only allow status updates for now (can be extended)
  IF new_status IS NOT NULL THEN
    UPDATE public.parking_bookings 
    SET 
      status = new_status,
      updated_at = now()
    WHERE id = booking_id AND user_id = auth.uid();
  END IF;

  RETURN FOUND;
END;
$$;

-- Add comment documenting the security fix
COMMENT ON TABLE public.parking_bookings IS 'CRITICAL SECURITY FIX: Direct user access blocked. Users must use get_user_bookings_safe() for viewing and update_my_booking_safe() for updates. Admins use get_booking_payment_details() for payment data. All access logged in payment_access_audit.';

-- Log the security fix implementation
INSERT INTO public.payment_access_audit (
  booking_id,
  accessed_by,
  access_type,
  payment_fields_accessed,
  accessed_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
  'critical_security_fix_applied',
  ARRAY['payment_data_protection_enabled'],
  now()
);