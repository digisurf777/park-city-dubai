-- Update get_owner_active_bookings function with improved matching logic
CREATE OR REPLACE FUNCTION public.get_owner_active_bookings()
 RETURNS TABLE(id uuid, location text, zone text, start_time timestamp with time zone, end_time timestamp with time zone, status text, driver_name text, unread_messages bigint, chat_available boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- Enhanced matching logic for bookings to owner's listings
  INNER JOIN public.parking_listings pl ON (
    -- Primary match: exact address and zone
    (pl.address = pb.location AND pl.zone = pb.zone)
    OR 
    -- Fallback: match by title if location contains listing title
    (pb.location ILIKE '%' || pl.title || '%' AND pl.status IN ('approved', 'published'))
    OR
    -- Secondary fallback: match by address if zone is generic
    (pl.address = pb.location AND pb.zone = 'Find Parking Page')
  )
  AND pl.owner_id = current_user_id
  AND pl.status IN ('approved', 'published')
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
    AND dom.owner_id = current_user_id
    GROUP BY dom.booking_id
  ) msg_count ON msg_count.booking_id = pb.id
  WHERE pb.status IN ('confirmed', 'approved', 'pending')
  AND pb.end_time >= now()
  ORDER BY pb.start_time ASC;
END;
$function$