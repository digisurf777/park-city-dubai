-- Enable chat immediately after booking approval (remove 48-hour window)
-- Drop and recreate send_booking_message function

DROP FUNCTION IF EXISTS public.send_booking_message(uuid, text);

CREATE FUNCTION public.send_booking_message(p_booking_id uuid, p_message text)
RETURNS SETOF driver_owner_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid;
  booking_record parking_bookings;
  is_driver boolean := false;
  owner_uuid uuid;
  driver_uuid uuid;
  listing_uuid uuid;
BEGIN
  -- Get authenticated user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_message IS NULL OR LENGTH(trim(p_message)) = 0 THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;

  SELECT * INTO booking_record FROM public.parking_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Chat available immediately when approved/confirmed until booking ends
  IF NOT (booking_record.status IN ('confirmed','approved') AND now() <= booking_record.end_time) THEN
    RAISE EXCEPTION 'Chat is not available for this booking at this time';
  END IF;

  -- Determine if user is driver or owner with access
  is_driver := (booking_record.user_id = current_user_id);

  IF NOT is_driver THEN
    -- verify owner access through listings
    PERFORM 1 FROM public.parking_listings pl
    WHERE pl.owner_id = current_user_id
      AND pl.status IN ('approved','published')
      AND (
        (pl.address = booking_record.location AND pl.zone = booking_record.zone)
        OR (booking_record.location ILIKE '%' || pl.title || '%')
        OR (pl.address = booking_record.location AND booking_record.zone = 'Find Parking Page')
      );
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Access denied: You must be the booking driver or space owner';
    END IF;
  END IF;

  -- Get the owner ID for this booking's location
  SELECT pl.owner_id, pl.id INTO owner_uuid, listing_uuid
  FROM public.parking_listings pl
  WHERE pl.status IN ('approved','published')
    AND (
      (pl.address = booking_record.location AND pl.zone = booking_record.zone)
      OR (booking_record.location ILIKE '%' || pl.title || '%')
      OR (pl.address = booking_record.location AND booking_record.zone = 'Find Parking Page')
    )
  LIMIT 1;

  IF owner_uuid IS NULL THEN
    RAISE EXCEPTION 'Could not determine parking space owner';
  END IF;

  driver_uuid := booking_record.user_id;

  -- Insert message with violation detection
  RETURN QUERY
  INSERT INTO public.driver_owner_messages (
    booking_id, listing_id, driver_id, owner_id, from_driver, message, read_status, contains_violation
  ) VALUES (
    p_booking_id, listing_uuid, driver_uuid, owner_uuid, is_driver, p_message, false,
    -- Basic violation detection
    (p_message ~* '\+?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}' OR 
     p_message ~* '\d{10,}' OR 
     p_message ~* 'whatsapp|telegram|signal|email|@' OR
     p_message ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
  ) RETURNING *;
END;
$$;