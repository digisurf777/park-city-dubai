-- Fix the get_booking_details_for_chat function to properly join profiles for driver info
CREATE OR REPLACE FUNCTION public.get_booking_details_for_chat(p_booking_id uuid)
RETURNS TABLE (
  booking_id uuid,
  listing_id uuid,
  driver_id uuid,
  driver_name text,
  driver_email text,
  owner_id uuid,
  listing_title text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text,
  is_owner boolean,
  is_driver boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    pb.listing_id,
    pb.user_id as driver_id,
    COALESCE(p.full_name, 'Driver') as driver_name,
    COALESCE(p.email, '') as driver_email,
    pl.owner_id,
    pl.title as listing_title,
    pb.start_time,
    pb.end_time,
    pb.status,
    (pl.owner_id = v_current_user) as is_owner,
    (pb.user_id = v_current_user) as is_driver
  FROM parking_bookings pb
  JOIN parking_listings pl ON pb.listing_id = pl.id
  LEFT JOIN profiles p ON pb.user_id = p.user_id
  WHERE pb.id = p_booking_id
    AND (pl.owner_id = v_current_user OR pb.user_id = v_current_user);
END;
$$;