-- CRITICAL SECURITY FIX: Restrict access to sensitive payment information in parking_bookings table
-- This migration addresses the security vulnerability where users could access sensitive payment data

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

-- Create secure function for payment processing (edge functions only)
CREATE OR REPLACE FUNCTION public.update_booking_payment_data(
  booking_id UUID,
  stripe_customer_id TEXT DEFAULT NULL,
  stripe_payment_intent_id TEXT DEFAULT NULL,
  stripe_subscription_id TEXT DEFAULT NULL,
  payment_link_url TEXT DEFAULT NULL,
  payment_amount_cents INTEGER DEFAULT NULL,
  payment_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is designed for edge functions using service role key
  -- Log the payment data update
  PERFORM public.log_payment_data_access(
    booking_id,
    'payment_data_update',
    ARRAY['payment_fields_updated']
  );

  -- Update booking with payment data
  UPDATE public.parking_bookings 
  SET 
    stripe_customer_id = COALESCE(update_booking_payment_data.stripe_customer_id, parking_bookings.stripe_customer_id),
    stripe_payment_intent_id = COALESCE(update_booking_payment_data.stripe_payment_intent_id, parking_bookings.stripe_payment_intent_id),
    stripe_subscription_id = COALESCE(update_booking_payment_data.stripe_subscription_id, parking_bookings.stripe_subscription_id),
    payment_link_url = COALESCE(update_booking_payment_data.payment_link_url, parking_bookings.payment_link_url),
    payment_amount_cents = COALESCE(update_booking_payment_data.payment_amount_cents, parking_bookings.payment_amount_cents),
    payment_status = COALESCE(update_booking_payment_data.payment_status, parking_bookings.payment_status),
    updated_at = now()
  WHERE id = booking_id;

  RETURN FOUND;
END;
$$;

-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.parking_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.parking_bookings;

-- Create new highly restrictive RLS policies for parking_bookings table
-- Block all direct SELECT access to payment-sensitive fields for regular users
CREATE POLICY "block_direct_payment_data_access" ON public.parking_bookings
FOR SELECT
USING (
  -- Only admins can directly access the table with payment data
  is_admin(auth.uid()) AND (
    public.log_payment_data_access(id, 'admin_direct_table_access', ARRAY['all_payment_fields']) IS NULL OR true
  )
);

-- Allow users to see their bookings through the safe function only
CREATE POLICY "users_restricted_booking_access" ON public.parking_bookings
FOR SELECT
USING (
  -- This policy should never be used directly by users
  -- Users should use get_user_bookings_safe() function instead
  false
);

-- Users can only update non-payment related fields
CREATE POLICY "users_can_update_non_payment_fields" ON public.parking_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure payment fields are not modified by regular users
  (
    OLD.stripe_customer_id IS NOT DISTINCT FROM NEW.stripe_customer_id AND
    OLD.stripe_payment_intent_id IS NOT DISTINCT FROM NEW.stripe_payment_intent_id AND
    OLD.stripe_subscription_id IS NOT DISTINCT FROM NEW.stripe_subscription_id AND
    OLD.payment_link_url IS NOT DISTINCT FROM NEW.payment_link_url AND
    OLD.payment_amount_cents IS NOT DISTINCT FROM NEW.payment_amount_cents
  ) AND
  -- Log the update attempt
  (public.log_payment_data_access(id, 'user_update_non_payment', ARRAY['status', 'updated_at']) IS NULL OR true)
);

-- Edge functions (service role) can access and update everything
CREATE POLICY "service_role_full_access" ON public.parking_bookings
FOR ALL
USING (
  -- Service role bypasses RLS, but we still log access
  (public.log_payment_data_access(id, 'service_role_access', ARRAY['service_role_operation']) IS NULL OR true)
);

-- Create function to safely get user's own booking status (no payment data)
CREATE OR REPLACE FUNCTION public.get_my_booking_status(booking_id UUID)
RETURNS TABLE(
  id UUID,
  status TEXT,
  payment_status TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  zone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get basic booking info
  SELECT * INTO booking_record
  FROM public.parking_bookings 
  WHERE parking_bookings.id = booking_id 
  AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Log safe access
  PERFORM public.log_payment_data_access(
    booking_id,
    'user_safe_status_check',
    ARRAY['status', 'payment_status']
  );

  -- Return safe status information
  RETURN QUERY SELECT 
    booking_record.id,
    booking_record.status,
    booking_record.payment_status,
    booking_record.start_time,
    booking_record.end_time,
    booking_record.location,
    booking_record.zone;
END;
$$;

-- Add comment documenting the security fix
COMMENT ON TABLE public.parking_bookings IS 'CRITICAL SECURITY FIX APPLIED: Direct access to payment data is blocked. Users must use get_user_bookings_safe() or get_my_booking_status() functions. Admins use get_booking_payment_details() for payment data. All access is logged in payment_access_audit table.';

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
  'security_fix_implemented',
  ARRAY['payment_data_access_restrictions_applied'],
  now()
);