-- Create secure RPC to get booking details for chat (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.get_booking_details_for_chat(p_booking_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  location text,
  zone text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  booking_record RECORD;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get booking details
  SELECT * INTO booking_record
  FROM public.parking_bookings pb
  WHERE pb.id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Check if user is the driver OR the owner of matching listing
  IF booking_record.user_id = current_user_id THEN
    -- User is the driver
    RETURN QUERY
    SELECT 
      booking_record.id,
      booking_record.user_id,
      booking_record.location,
      booking_record.zone,
      booking_record.start_time,
      booking_record.end_time,
      booking_record.status;
  ELSIF EXISTS (
    SELECT 1 
    FROM public.parking_listings pl
    WHERE pl.address = booking_record.location 
    AND pl.zone = booking_record.zone
    AND pl.owner_id = current_user_id
    AND pl.status IN ('approved', 'published')
  ) THEN
    -- User is the owner of the listing
    RETURN QUERY
    SELECT 
      booking_record.id,
      booking_record.user_id,
      booking_record.location,
      booking_record.zone,
      booking_record.start_time,
      booking_record.end_time,
      booking_record.status;
  ELSE
    RAISE EXCEPTION 'Access denied: Not authorized to view this booking';
  END IF;
END;
$function$;

-- Create secure RPC to get owner's active bookings with chat info
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
  -- Match bookings to owner's listings by address+zone
  INNER JOIN public.parking_listings pl ON (
    pl.address = pb.location 
    AND pl.zone = pb.zone 
    AND pl.owner_id = current_user_id
    AND pl.status IN ('approved', 'published')
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
    AND dom.owner_id = current_user_id
    GROUP BY dom.booking_id
  ) msg_count ON msg_count.booking_id = pb.id
  WHERE pb.status IN ('confirmed', 'approved', 'pending')
  AND pb.end_time >= now()
  ORDER BY pb.start_time ASC;
END;
$function$;