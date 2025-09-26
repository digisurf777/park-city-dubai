-- Create secure RPC helpers for chat to ensure consistent access
-- 1) Get booking messages with access checks
CREATE OR REPLACE FUNCTION public.get_booking_messages(p_booking_id uuid)
RETURNS SETOF public.driver_owner_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Ensure user can access this booking (driver or matching owner)
  SELECT * INTO booking_record
  FROM public.parking_bookings pb
  WHERE pb.id = p_booking_id
    AND (
      pb.user_id = current_user_id
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = current_user_id
          AND pl.status IN ('approved','published')
          AND (
            (pl.address = pb.location AND pl.zone = pb.zone)
            OR (pb.location ILIKE '%' || pl.title || '%')
            OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
          )
      )
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Not authorized to view messages for this booking';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.driver_owner_messages dom
  WHERE dom.booking_id = p_booking_id
  ORDER BY dom.created_at ASC;
END;$$;

-- 2) Mark booking messages as read for current user
CREATE OR REPLACE FUNCTION public.mark_booking_messages_read(p_booking_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  current_user_id uuid;
  is_driver boolean;
  updated_count integer := 0;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO booking_record FROM public.parking_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Verify access like in get_booking_messages
  PERFORM 1 FROM public.parking_bookings pb
  WHERE pb.id = p_booking_id
    AND (
      pb.user_id = current_user_id
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = current_user_id
          AND pl.status IN ('approved','published')
          AND (
            (pl.address = pb.location AND pl.zone = pb.zone)
            OR (pb.location ILIKE '%' || pl.title || '%')
            OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
          )
      )
    );
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  is_driver := booking_record.user_id = current_user_id;

  UPDATE public.driver_owner_messages
  SET read_status = true, updated_at = now()
  WHERE booking_id = p_booking_id
    AND read_status = false
    AND (
      (is_driver AND from_driver = false) OR
      (NOT is_driver AND from_driver = true)
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;$$;

-- 3) Send a booking message with proper ownership and time checks
CREATE OR REPLACE FUNCTION public.send_booking_message(p_booking_id uuid, p_message text)
RETURNS public.driver_owner_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
  owner_uuid uuid;
  current_user_id uuid;
  is_driver boolean;
  inserted_row public.driver_owner_messages%ROWTYPE;
BEGIN
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

  -- Time window: 48h before start until end, and status confirmed/approved
  IF NOT (booking_record.status IN ('confirmed','approved') AND 
          (now() >= (booking_record.start_time - interval '48 hours') AND now() <= booking_record.end_time)) THEN
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
      RAISE EXCEPTION 'Access denied: Only the driver or the matching listing owner can send messages';
    END IF;
  END IF;

  -- Resolve listing owner to store in row
  owner_uuid := public.get_booking_owner_id(p_booking_id);

  INSERT INTO public.driver_owner_messages (
    booking_id, driver_id, owner_id, message, from_driver, is_expired
  ) VALUES (
    p_booking_id,
    booking_record.user_id,
    owner_uuid,
    trim(p_message),
    is_driver,
    false
  ) RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;$$;
