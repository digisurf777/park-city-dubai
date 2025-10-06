-- Drop and recreate function with customer information
DROP FUNCTION IF EXISTS public.get_pre_authorization_overview();

CREATE FUNCTION public.get_pre_authorization_overview()
RETURNS TABLE(
  booking_id uuid,
  user_full_name text,
  user_email text,
  user_phone text,
  verification_status text,
  location text,
  zone text,
  pre_authorization_amount integer,
  capture_amount integer,
  security_deposit_amount integer,
  pre_authorization_expires_at timestamp with time zone,
  payment_status text,
  authorization_extended_count integer,
  days_until_expiry integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    user_info.full_name as user_full_name,
    user_info.email as user_email,
    user_info.phone as user_phone,
    user_info.verification_status,
    pb.location,
    pb.zone,
    pb.pre_authorization_amount,
    pb.capture_amount,
    pb.security_deposit_amount,
    pb.pre_authorization_expires_at,
    pb.payment_status,
    pb.authorization_extended_count,
    CASE 
      WHEN pb.pre_authorization_expires_at IS NOT NULL THEN
        EXTRACT(DAY FROM pb.pre_authorization_expires_at - now())::integer
      ELSE NULL
    END as days_until_expiry,
    pb.created_at
  FROM public.parking_bookings pb
  CROSS JOIN LATERAL (
    SELECT * FROM public.get_user_display_info(pb.user_id)
  ) AS user_info
  WHERE pb.payment_status IN ('pending', 'pre_authorized', 'partially_captured')
    AND pb.pre_authorization_amount IS NOT NULL
  ORDER BY pb.pre_authorization_expires_at ASC NULLS LAST;
END;
$$;