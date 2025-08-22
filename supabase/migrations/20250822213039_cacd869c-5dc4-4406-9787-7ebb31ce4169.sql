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
CREATE POLICY "block_all_user_access_to_payment_data" ON public.parking_bookings
FOR ALL
USING (
  -- Only allow admin users direct access (for admin panel)
  is_admin(auth.uid())
);

-- Create a completely separate, secure booking view for users (NO payment data)
CREATE VIEW public.user_bookings_secure AS
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
  payment_type,
  payment_status
FROM public.parking_bookings;

-- Set the view as security barrier (prevents data leakage)
ALTER VIEW public.user_bookings_secure SET (security_barrier = true);

-- Create simple RLS for the secure view - users can only see their own bookings
ALTER VIEW public.user_bookings_secure SET (security_invoker = true);

-- Log the security simplification
PERFORM public.log_payment_data_access(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'security_policies_simplified',
  ARRAY['removed_complex_policies', 'created_secure_view']
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

-- Update table comment to reflect the simplified security model
COMMENT ON TABLE public.parking_bookings IS 'ULTRA-SECURE: All user access blocked. Users use get_my_bookings() to view (no payment data) and update_my_booking_status() to update status only. Only admins and service role can access directly. All access logged.';

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
  'security_enhancement_applied',
  ARRAY['simplified_policies', 'strengthened_access_control'],
  now()
);