
-- Create function to get all unified customers (drivers and owners)
CREATE OR REPLACE FUNCTION get_unified_customers()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  user_type text,
  total_bookings bigint,
  total_payments bigint,
  total_booking_amount numeric,
  total_payment_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH driver_data AS (
    SELECT 
      pb.user_id,
      COUNT(pb.id) as booking_count,
      COALESCE(SUM(pb.cost_aed), 0) as booking_total
    FROM parking_bookings pb
    GROUP BY pb.user_id
  ),
  owner_data AS (
    SELECT 
      op.owner_id as user_id,
      COUNT(op.id) as payment_count,
      COALESCE(SUM(op.amount_aed), 0) as payment_total
    FROM owner_payments op
    GROUP BY op.owner_id
  ),
  all_users AS (
    SELECT user_id FROM driver_data
    UNION
    SELECT user_id FROM owner_data
  )
  SELECT 
    au.user_id,
    COALESCE(p.full_name, p.email, 'Unknown') as full_name,
    p.email,
    CASE 
      WHEN dd.user_id IS NOT NULL AND od.user_id IS NOT NULL THEN 'both'
      WHEN dd.user_id IS NOT NULL THEN 'seeker'
      WHEN od.user_id IS NOT NULL THEN 'provider'
      ELSE 'seeker'
    END as user_type,
    COALESCE(dd.booking_count, 0) as total_bookings,
    COALESCE(od.payment_count, 0) as total_payments,
    COALESCE(dd.booking_total, 0) as total_booking_amount,
    COALESCE(od.payment_total, 0) as total_payment_amount
  FROM all_users au
  LEFT JOIN profiles p ON p.user_id = au.user_id
  LEFT JOIN driver_data dd ON dd.user_id = au.user_id
  LEFT JOIN owner_data od ON od.user_id = au.user_id
  ORDER BY 
    COALESCE(p.full_name, p.email, 'Unknown');
END;
$$;
