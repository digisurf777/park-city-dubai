-- Continue fixing remaining database functions for exact listing_id matching

-- 5. Fix get_unread_chat_count() function
CREATE OR REPLACE FUNCTION public.get_unread_chat_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Count unread messages for this user using exact listing_id matching
  WITH user_bookings AS (
    -- Bookings where user is the driver
    SELECT pb.id as booking_id, pb.listing_id
    FROM parking_bookings pb
    WHERE pb.user_id = p_user_id
    
    UNION
    
    -- Bookings where user is the owner (using exact listing_id match)
    SELECT pb.id as booking_id, pb.listing_id
    FROM parking_bookings pb
    JOIN parking_listings pl ON pb.listing_id = pl.id
    WHERE pl.owner_id = p_user_id
  )
  SELECT COUNT(*)::integer
  INTO v_count
  FROM driver_owner_messages dom
  JOIN user_bookings ub ON dom.booking_id = ub.booking_id
  WHERE dom.sender_id != p_user_id
    AND dom.read_at IS NULL;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- 6. Fix get_booking_owner_id() function  
CREATE OR REPLACE FUNCTION public.get_booking_owner_id(p_booking_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  -- Get owner via exact listing_id match
  SELECT pl.owner_id
  INTO v_owner_id
  FROM parking_listings pl
  JOIN parking_bookings pb ON pb.listing_id = pl.id
  WHERE pb.id = p_booking_id;
  
  RETURN v_owner_id;
END;
$$;

-- 7. Fix send_booking_message() function
CREATE OR REPLACE FUNCTION public.send_booking_message(
  p_booking_id uuid,
  p_content text,
  p_sender_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id uuid;
  v_sender_id uuid;
  v_owner_id uuid;
  v_driver_id uuid;
BEGIN
  -- Get current user
  v_sender_id := auth.uid();
  
  -- Get booking details with exact listing_id matching
  SELECT pl.owner_id, pb.user_id
  INTO v_owner_id, v_driver_id
  FROM parking_bookings pb
  JOIN parking_listings pl ON pb.listing_id = pl.id
  WHERE pb.id = p_booking_id;
  
  -- Verify sender has access to this booking
  IF p_sender_type = 'owner' AND v_sender_id != v_owner_id THEN
    RAISE EXCEPTION 'Not authorized to send messages for this booking';
  END IF;
  
  IF p_sender_type = 'driver' AND v_sender_id != v_driver_id THEN
    RAISE EXCEPTION 'Not authorized to send messages for this booking';
  END IF;
  
  -- Insert the message
  INSERT INTO driver_owner_messages (
    booking_id,
    listing_id,
    sender_id,
    sender_type,
    content
  )
  SELECT 
    p_booking_id,
    pb.listing_id,
    v_sender_id,
    p_sender_type,
    p_content
  FROM parking_bookings pb
  WHERE pb.id = p_booking_id
  RETURNING id INTO v_message_id;
  
  RETURN v_message_id;
END;
$$;