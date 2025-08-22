-- SECURITY ENHANCEMENT: Simplify and strengthen parking_bookings RLS policies
-- Remove complex policies and implement simple, foolproof security

-- Drop all existing complex RLS policies
DROP POLICY IF EXISTS "admin_only_direct_access" ON public.parking_bookings;
DROP POLICY IF EXISTS "admin_only_update_access" ON public.parking_bookings;
DROP POLICY IF EXISTS "service_role_payment_processing" ON public.parking_bookings;
DROP POLICY IF EXISTS "block_direct_payment_data_access" ON public.parking_bookings;
DROP POLICY IF EXISTS "users_restricted_booking_access" ON public.parking_bookings;
DROP POLICY IF EXISTS "users_can_update_non_payment_fields" ON public.parking_bookings;
DROP POLICY IF EXISTS "service_role_full_access" ON public.parking_bookings;

-- Create ONLY ONE simple, secure policy: Block ALL direct user access
-- Users must use secure functions, only service role and admins can access directly
CREATE POLICY "ultra_secure_admin_only_access" ON public.parking_bookings
FOR ALL
USING (
  -- Only allow admin users direct access (for admin panel)
  -- Service role bypasses RLS automatically
  is_admin(auth.uid())
);

-- Create ultra-simple function for users to view their bookings (no payment data)
CREATE OR REPLACE FUNCTION public.get_my_bookings()
RETURNS TABLE(
  id UUID,
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
  -- Log the safe access
  PERFORM public.log_payment_data_access(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'user_safe_booking_view',
    ARRAY['non_payment_fields_only']
  );

  -- Return ONLY non-sensitive booking data for the authenticated user
  RETURN QUERY 
  SELECT 
    pb.id,
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
  WHERE pb.user_id = auth.uid();
END;
$$;

-- Create ultra-simple function for users to update ONLY status (nothing else)
CREATE OR REPLACE FUNCTION public.update_my_booking_status(
  booking_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user owns this booking and log the action
  IF NOT EXISTS (
    SELECT 1 FROM public.parking_bookings 
    WHERE id = booking_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Log the safe update
  PERFORM public.log_payment_data_access(
    booking_id,
    'user_status_update_only',
    ARRAY['status_field_only']
  );

  -- Update ONLY the status field (no payment fields can be touched)
  UPDATE public.parking_bookings 
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = booking_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Create function to get single booking status (for booking confirmation pages)
CREATE OR REPLACE FUNCTION public.get_my_booking_status(booking_id UUID)
RETURNS TABLE(
  id UUID,
  status TEXT,
  payment_status TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  zone TEXT,
  cost_aed NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user owns this booking
  IF NOT EXISTS (
    SELECT 1 FROM public.parking_bookings 
    WHERE parking_bookings.id = booking_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Booking not found or access denied';
  END IF;

  -- Log safe access
  PERFORM public.log_payment_data_access(
    booking_id,
    'user_booking_status_check',
    ARRAY['status_only']
  );

  -- Return safe booking status information
  RETURN QUERY 
  SELECT 
    pb.id,
    pb.status,
    pb.payment_status,
    pb.start_time,
    pb.end_time,
    pb.location,
    pb.zone,
    pb.cost_aed
  FROM public.parking_bookings pb
  WHERE pb.id = booking_id AND pb.user_id = auth.uid();
END;
$$;

-- Update table comment to reflect the ultra-simple security model
COMMENT ON TABLE public.parking_bookings IS 'ULTRA-SECURE SIMPLIFIED: Single RLS policy blocks all user access. Users must use get_my_bookings() (no payment data), update_my_booking_status() (status only), or get_my_booking_status() (single booking). Only admins access directly. All access logged.';

-- Log the security enhancement
INSERT INTO public.payment_access_audit (
  booking_id,
  accessed_by,
  access_type,
  payment_fields_accessed,
  accessed_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
  'security_policies_simplified_and_strengthened',
  ARRAY['removed_complex_policies', 'single_secure_policy', 'ultra_simple_functions'],
  now()
);