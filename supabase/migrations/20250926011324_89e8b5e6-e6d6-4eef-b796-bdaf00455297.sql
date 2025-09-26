-- Fix get_owner_active_bookings function to use same flexible matching logic as RLS policies
-- This will allow owners to see bookings with different zone matching

DROP FUNCTION IF EXISTS public.get_owner_active_bookings();

CREATE OR REPLACE FUNCTION public.get_owner_active_bookings()
RETURNS TABLE(
  id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text,
  driver_name text,
  unread_messages bigint,
  chat_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    pb.id,
    pb.location,
    pb.zone,
    pb.start_time,
    pb.end_time,
    pb.status,
    COALESCE(p.full_name, 'Driver') as driver_name,
    COALESCE(msg_count.unread_count, 0) as unread_messages,
    CASE 
      WHEN pb.status IN ('confirmed', 'approved') 
      AND (
        (now() >= (pb.start_time - '48:00:00'::interval) AND now() <= pb.end_time)
        OR (now() >= pb.start_time AND now() <= pb.end_time)
      )
      THEN true
      ELSE false
    END as chat_available
  FROM public.parking_bookings pb
  -- Use the SAME flexible matching logic as RLS policies
  INNER JOIN public.parking_listings pl ON (
    pl.owner_id = current_user_id
    AND pl.status IN ('approved', 'published')
    AND (
      -- Exact match: address and zone
      (pl.address = pb.location AND pl.zone = pb.zone)
      OR 
      -- Booking location contains listing title
      (pb.location ILIKE '%' || pl.title || '%')
      OR
      -- Address match with generic zone 'Find Parking Page'
      (pl.address = pb.location AND pb.zone = 'Find Parking Page')
    )
  )
  -- Get driver profile info
  LEFT JOIN public.profiles p ON p.user_id = pb.user_id
  -- Count unread messages from driver
  LEFT JOIN (
    SELECT 
      dom.booking_id,
      COUNT(*) as unread_count
    FROM public.driver_owner_messages dom
    WHERE dom.from_driver = true 
    AND dom.read_status = false
    GROUP BY dom.booking_id
  ) msg_count ON msg_count.booking_id = pb.id
  WHERE pb.status IN ('confirmed', 'approved', 'pending')
  AND pb.end_time >= now()
  ORDER BY pb.start_time ASC;
END;
$$;