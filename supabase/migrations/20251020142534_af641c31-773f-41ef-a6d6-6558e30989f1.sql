-- Fix ambiguous column reference in unified customer payment history
CREATE OR REPLACE FUNCTION public.get_unified_customer_payment_history()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  user_type text,
  driver_bookings_count bigint,
  owner_payments_count bigint,
  total_driver_spent numeric,
  total_owner_received numeric,
  verification_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH driver_stats AS (
    SELECT 
      pb.user_id,
      COUNT(*)::bigint as booking_count,
      COALESCE(SUM(pb.cost_aed), 0) as total_spent
    FROM public.parking_bookings pb
    WHERE pb.status IN ('confirmed', 'completed', 'approved')
    GROUP BY pb.user_id
  ),
  owner_stats AS (
    SELECT 
      op.owner_id as user_id,
      COUNT(*)::bigint as payment_count,
      COALESCE(SUM(op.amount_aed), 0) as total_received
    FROM public.owner_payments op
    GROUP BY op.owner_id
  ),
  all_users AS (
    SELECT DISTINCT user_id FROM driver_stats
    UNION
    SELECT DISTINCT user_id FROM owner_stats
  )
  SELECT 
    au.user_id,
    COALESCE(
      p.full_name,
      auth_users.raw_user_meta_data->>'full_name',
      auth_users.raw_user_meta_data->>'name',
      'User'
    )::text as full_name,
    COALESCE(p.email, auth_users.email)::text as email,
    COALESCE(p.user_type, 'seeker')::text as user_type,
    COALESCE(ds.booking_count, 0) as driver_bookings_count,
    COALESCE(os.payment_count, 0) as owner_payments_count,
    COALESCE(ds.total_spent, 0) as total_driver_spent,
    COALESCE(os.total_received, 0) as total_owner_received,
    COALESCE(uv.verification_status, 'not_verified')::text as verification_status
  FROM all_users au
  LEFT JOIN public.profiles p ON p.user_id = au.user_id
  LEFT JOIN auth.users auth_users ON auth_users.id = au.user_id
  LEFT JOIN driver_stats ds ON ds.user_id = au.user_id
  LEFT JOIN owner_stats os ON os.user_id = au.user_id
  LEFT JOIN LATERAL (
    SELECT verification_status 
    FROM public.user_verifications 
    WHERE user_verifications.user_id = au.user_id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) uv ON true
  ORDER BY 
    COALESCE(ds.booking_count, 0) + COALESCE(os.payment_count, 0) DESC,
    full_name ASC;
END;
$function$;