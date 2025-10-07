-- Create function to get pre-authorization overview with all necessary booking data
CREATE OR REPLACE FUNCTION public.get_pre_authorization_overview()
RETURNS TABLE (
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
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Unknown') as user_full_name,
    COALESCE(p.email, au.email, 'No email') as user_email,
    COALESCE(p.phone, au.raw_user_meta_data->>'phone', 'No phone') as user_phone,
    COALESCE(uv.verification_status, 'not_verified') as verification_status,
    pb.location,
    pb.zone,
    COALESCE(pb.pre_authorization_amount, pb.payment_amount_cents, 0) as pre_authorization_amount,
    COALESCE(pb.capture_amount, 0) as capture_amount,
    COALESCE(pb.security_deposit_amount, 0) as security_deposit_amount,
    pb.pre_authorization_expires_at,
    pb.payment_status,
    COALESCE(pb.authorization_extended_count, 0) as authorization_extended_count,
    CASE 
      WHEN pb.pre_authorization_expires_at IS NULL THEN 0
      ELSE EXTRACT(day FROM (pb.pre_authorization_expires_at - now()))::integer
    END as days_until_expiry,
    pb.created_at
  FROM public.parking_bookings pb
  LEFT JOIN public.profiles p ON p.user_id = pb.user_id
  LEFT JOIN auth.users au ON au.id = pb.user_id
  LEFT JOIN public.user_verifications uv ON uv.user_id = pb.user_id
  WHERE pb.payment_status = 'pre_authorized'
    AND pb.stripe_payment_intent_id IS NOT NULL
  ORDER BY pb.pre_authorization_expires_at ASC NULLS LAST;
END;
$$;

-- Grant execute permission to authenticated users (will be checked by is_admin inside function)
GRANT EXECUTE ON FUNCTION public.get_pre_authorization_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pre_authorization_overview() TO service_role;