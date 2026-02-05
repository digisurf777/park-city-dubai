-- Fix profiles join in get_owner_active_bookings
-- Bug: was joining on p.id instead of p.user_id

CREATE OR REPLACE FUNCTION public.get_owner_active_bookings()
RETURNS TABLE(
  booking_id uuid, 
  listing_id uuid, 
  driver_id uuid, 
  driver_name text, 
  driver_email text, 
  listing_title text, 
  start_time timestamp with time zone, 
  end_time timestamp with time zone, 
  status text, 
  has_unread_messages boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    pb.id as booking_id,
    pb.listing_id,
    pb.user_id as driver_id,
    COALESCE(p.full_name, 'Driver') as driver_name,
    COALESCE(p.email, '') as driver_email,
    pl.title as listing_title,
    pb.start_time,
    pb.end_time,
    pb.status::text,
    EXISTS (
      SELECT 1 FROM driver_owner_messages dom 
      WHERE dom.booking_id = pb.id 
      AND dom.from_driver = true 
      AND dom.read_status = false
    ) as has_unread_messages
  FROM parking_bookings pb
  JOIN parking_listings pl ON pb.listing_id = pl.id
  LEFT JOIN profiles p ON pb.user_id = p.user_id  -- FIX: join on user_id not id
  WHERE pl.owner_id = current_user_id
  AND pb.status IN ('confirmed', 'approved')
  AND pb.end_time >= NOW()
  ORDER BY pb.start_time ASC;
END;
$$;