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
  -- Admin-only
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH driver_stats AS (
    SELECT 
      pb.user_id AS user_id,
      COUNT(*)::bigint AS booking_count,
      COALESCE(SUM(pb.cost_aed), 0) AS total_spent
    FROM public.parking_bookings pb
    WHERE pb.status IN ('confirmed', 'completed', 'approved')
    GROUP BY pb.user_id
  ),
  owner_stats AS (
    SELECT 
      op.owner_id AS user_id,
      COUNT(*)::bigint AS payment_count,
      COALESCE(SUM(op.amount_aed), 0) AS total_received
    FROM public.owner_payments op
    GROUP BY op.owner_id
  ),
  listing_owners AS (
    SELECT DISTINCT pl.owner_id AS user_id
    FROM public.parking_listings pl
    WHERE pl.owner_id IS NOT NULL
  ),
  all_users AS (
    SELECT DISTINCT user_id FROM driver_stats
    UNION
    SELECT DISTINCT user_id FROM owner_stats
    UNION
    SELECT DISTINCT user_id FROM listing_owners
  ),
  latest_verification AS (
    SELECT DISTINCT ON (uv.user_id)
      uv.user_id,
      uv.verification_status
    FROM public.user_verifications uv
    ORDER BY uv.user_id, uv.created_at DESC
  )
  SELECT 
    au.user_id,
    COALESCE(
      p.full_name,
      au_auth.raw_user_meta_data->>'full_name',
      au_auth.raw_user_meta_data->>'name',
      'User'
    )::text AS full_name,
    COALESCE(p.email, au_auth.email)::text AS email,
    COALESCE(p.user_type, 'seeker')::text AS user_type,
    COALESCE(ds.booking_count, 0) AS driver_bookings_count,
    COALESCE(os.payment_count, 0) AS owner_payments_count,
    COALESCE(ds.total_spent, 0) AS total_driver_spent,
    COALESCE(os.total_received, 0) AS total_owner_received,
    COALESCE(lv.verification_status, 'not_verified')::text AS verification_status
  FROM all_users au
  LEFT JOIN public.profiles p ON p.user_id = au.user_id
  LEFT JOIN auth.users au_auth ON au_auth.id = au.user_id
  LEFT JOIN driver_stats ds ON ds.user_id = au.user_id
  LEFT JOIN owner_stats os ON os.user_id = au.user_id
  LEFT JOIN latest_verification lv ON lv.user_id = au.user_id
  ORDER BY 
    (COALESCE(ds.booking_count, 0) + COALESCE(os.payment_count, 0)) DESC,
    full_name ASC;
END;
$function$;