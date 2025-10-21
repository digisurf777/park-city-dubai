-- Improve name/email fallback order for get_unified_customer_payment_history
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
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH driver_stats AS (
    SELECT pb.user_id,
           COUNT(*)::bigint AS booking_count,
           COALESCE(SUM(pb.cost_aed), 0) AS total_spent
    FROM public.parking_bookings pb
    WHERE pb.status IN ('approved','confirmed','completed')
    GROUP BY pb.user_id
  ),
  owner_stats AS (
    SELECT op.owner_id AS user_id,
           COUNT(*)::bigint AS payment_count,
           COALESCE(SUM(op.amount_aed), 0) AS total_received
    FROM public.owner_payments op
    WHERE COALESCE(op.status,'completed') IN ('completed','paid')
    GROUP BY op.owner_id
  ),
  chat_participants AS (
    SELECT DISTINCT driver_id AS user_id FROM public.driver_owner_messages
    UNION
    SELECT DISTINCT owner_id AS user_id FROM public.driver_owner_messages
  ),
  all_users AS (
    SELECT DISTINCT user_id FROM driver_stats
    UNION
    SELECT DISTINCT user_id FROM owner_stats
    UNION
    SELECT DISTINCT user_id FROM chat_participants
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
      NULLIF(TRIM(p.full_name), ''),
      NULLIF(TRIM(au_auth.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(au_auth.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(SPLIT_PART(p.email, '@', 1)), ''),
      NULLIF(TRIM(SPLIT_PART(au_auth.email, '@', 1)), ''),
      'Customer'
    )::text AS full_name,
    COALESCE(NULLIF(TRIM(p.email), ''), NULLIF(TRIM(au_auth.email), ''))::text AS email,
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
  ORDER BY (COALESCE(ds.booking_count, 0) + COALESCE(os.payment_count, 0)) DESC, full_name ASC;
END;
$function$;