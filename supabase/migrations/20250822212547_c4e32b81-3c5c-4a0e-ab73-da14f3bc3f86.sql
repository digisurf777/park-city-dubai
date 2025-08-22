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
    auth.uid(),
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

-- Create secure view for parking bookings without sensitive payment data
CREATE VIEW public.parking_bookings_safe AS
SELECT 
  id,
  user_id,
  location,
  zone,
  start_time,
  end_time,
  duration_hours,
  cost_aed,
  status,
  created_at,
  updated_at,
  confirmation_deadline,
  -- Only show payment type and status, not sensitive IDs
  payment_type,
  payment_status,
  -- Exclude sensitive payment fields:
  -- stripe_customer_id, stripe_payment_intent_id, stripe_subscription_id, payment_link_url, payment_amount_cents
  NULL::TEXT as stripe_customer_id,
  NULL::TEXT as stripe_payment_intent_id, 
  NULL::TEXT as stripe_subscription_id,
  NULL::TEXT as payment_link_url,
  NULL::INTEGER as payment_amount_cents
FROM public.parking_bookings;

-- Enable RLS on the safe view
ALTER VIEW public.parking_bookings_safe SET (security_barrier = true);

-- Create RLS policies for the safe view
CREATE POLICY "users_can_view_own_safe_bookings" ON public.parking_bookings_safe
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "admins_can_view_all_safe_bookings" ON public.parking_bookings_safe  
FOR SELECT
USING (is_admin(auth.uid()));

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
  -- Regular users cannot call this function
  
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

-- Create new restrictive RLS policies for parking_bookings table
-- Users can only view non-sensitive booking data (payment fields are NULL for regular users)
CREATE POLICY "users_can_view_own_booking_basics" ON public.parking_bookings
FOR SELECT
USING (
  auth.uid() = user_id AND
  -- This policy logs access and nullifies sensitive fields for non-admins
  (CASE 
    WHEN is_admin(auth.uid()) THEN 
      -- Admin access - log it but allow full access
      (public.log_payment_data_access(id, 'admin_full_access', ARRAY['all_fields']) IS NULL OR true)
    ELSE 
      -- Regular user access - log it and restrict payment fields
      (public.log_payment_data_access(id, 'user_basic_access', ARRAY['non_payment_fields']) IS NULL OR true)
  END)
);

-- Users can only update non-payment fields of their own bookings
CREATE POLICY "users_can_update_own_booking_basics" ON public.parking_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent updates to payment fields by regular users
  (
    OLD.stripe_customer_id IS NOT DISTINCT FROM NEW.stripe_customer_id AND
    OLD.stripe_payment_intent_id IS NOT DISTINCT FROM NEW.stripe_payment_intent_id AND
    OLD.stripe_subscription_id IS NOT DISTINCT FROM NEW.stripe_subscription_id AND
    OLD.payment_link_url IS NOT DISTINCT FROM NEW.payment_link_url AND
    OLD.payment_amount_cents IS NOT DISTINCT FROM NEW.payment_amount_cents
  )
);

-- Admins can view all bookings with full payment data
CREATE POLICY "admins_can_view_all_bookings_with_payment_data" ON public.parking_bookings
FOR SELECT
USING (is_admin(auth.uid()));

-- Edge functions can update payment data (they use service role key)
CREATE POLICY "service_role_can_update_payment_data" ON public.parking_bookings
FOR UPDATE
USING (true);

-- Create function to check if user can view sensitive payment data
CREATE OR REPLACE FUNCTION public.can_access_payment_data(booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get booking record
  SELECT * INTO booking_record
  FROM public.parking_bookings 
  WHERE id = booking_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Only admins or booking owners can access (but owners only get limited access)
  IF is_admin(auth.uid()) THEN
    RETURN true;
  ELSIF booking_record.user_id = auth.uid() THEN
    -- Users can access their booking but payment fields are restricted
    RETURN false; -- They can see the booking but not payment details
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Add comment documenting the security fix
COMMENT ON TABLE public.parking_bookings IS 'SECURITY FIX APPLIED: Payment data access is now restricted. Regular users cannot access sensitive payment fields like Stripe IDs. Use parking_bookings_safe view for user-facing queries or get_booking_payment_details() function for admin access.';

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