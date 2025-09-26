-- Create get_booking_details_for_chat function to support chat functionality
CREATE OR REPLACE FUNCTION public.get_booking_details_for_chat(p_booking_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, location text, zone text, start_time timestamp with time zone, end_time timestamp with time zone, status text)
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
    WHERE (
      -- Enhanced matching logic similar to get_owner_active_bookings
      (pl.address = booking_record.location AND pl.zone = booking_record.zone)
      OR 
      (booking_record.location ILIKE '%' || pl.title || '%' AND pl.status IN ('approved', 'published'))
      OR
      (pl.address = booking_record.location AND booking_record.zone = 'Find Parking Page')
    )
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
$function$