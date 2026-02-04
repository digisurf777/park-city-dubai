-- Update mark_booking_messages_read to reset notification_count when user reads chat
CREATE OR REPLACE FUNCTION public.mark_booking_messages_read(p_booking_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count integer;
  v_user_id uuid;
  v_is_driver boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user is driver or owner for this booking
  SELECT 
    CASE WHEN pb.user_id = v_user_id THEN true ELSE false END
  INTO v_is_driver
  FROM parking_bookings pb
  LEFT JOIN parking_listings pl ON pl.id = pb.listing_id
  WHERE pb.id = p_booking_id
    AND (pb.user_id = v_user_id OR pl.owner_id = v_user_id);

  IF v_is_driver IS NULL THEN
    RAISE EXCEPTION 'User does not have access to this booking chat';
  END IF;

  -- Mark messages as read based on user role
  IF v_is_driver THEN
    -- Driver is reading, so mark owner's messages (from_driver = false) as read
    UPDATE driver_owner_messages
    SET read_status = true, updated_at = NOW()
    WHERE booking_id = p_booking_id
      AND from_driver = false
      AND read_status = false;
  ELSE
    -- Owner is reading, so mark driver's messages (from_driver = true) as read
    UPDATE driver_owner_messages
    SET read_status = true, updated_at = NOW()
    WHERE booking_id = p_booking_id
      AND from_driver = true
      AND read_status = false;
  END IF;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Reset notification state including notification_count
  UPDATE chat_notification_state
  SET 
    last_read_at = NOW(),
    first_unread_message_at = NULL,
    notification_timer_active = false,
    notification_count = 0,
    updated_at = NOW()
  WHERE booking_id = p_booking_id;

  RETURN v_updated_count;
END;
$$;

-- Update mark_chat_messages_read to reset notification_count
CREATE OR REPLACE FUNCTION public.mark_chat_messages_read(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark all unread messages as read for this booking
  UPDATE driver_owner_messages
  SET read_status = true, updated_at = NOW()
  WHERE booking_id = p_booking_id
    AND read_status = false;

  -- Reset notification state including notification_count
  UPDATE chat_notification_state
  SET 
    last_read_at = NOW(),
    first_unread_message_at = NULL,
    notification_timer_active = false,
    notification_count = 0,
    updated_at = NOW()
  WHERE booking_id = p_booking_id;
END;
$$;

-- Update trigger function to reset notification_count when starting new cycle
CREATE OR REPLACE FUNCTION public.update_notification_state_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if this is a new unread message
  IF NEW.read_status = false THEN
    -- Insert or update the notification state
    INSERT INTO chat_notification_state (
      booking_id,
      first_unread_message_at,
      notification_timer_active,
      notification_count,
      created_at,
      updated_at
    )
    VALUES (
      NEW.booking_id,
      NOW(),
      true,
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (booking_id) DO UPDATE
    SET 
      -- Only set first_unread_message_at if there isn't already an unread message pending
      first_unread_message_at = COALESCE(chat_notification_state.first_unread_message_at, NOW()),
      notification_timer_active = true,
      -- Reset count if this is a fresh notification cycle (no pending unread)
      notification_count = CASE 
        WHEN chat_notification_state.first_unread_message_at IS NULL THEN 0 
        ELSE chat_notification_state.notification_count 
      END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;