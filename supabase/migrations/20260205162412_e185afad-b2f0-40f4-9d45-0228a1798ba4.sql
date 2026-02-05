-- Fix: Only reset notification timer when the recipient actually marks messages as read
-- Previously, anyone opening the chat would reset the timer (including the sender)

CREATE OR REPLACE FUNCTION public.mark_booking_messages_read(p_booking_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_driver boolean;
  v_updated_count integer := 0;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Determine if the current user is the driver (booking user) or owner
  SELECT EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = p_booking_id AND pb.user_id = v_user_id
  ) INTO v_is_driver;
  
  -- Mark messages as read where:
  -- - The message is for this booking
  -- - The message was sent TO the current user (not FROM them)
  -- - The message is not already read
  UPDATE driver_owner_messages
  SET read_status = true, updated_at = NOW()
  WHERE booking_id = p_booking_id
    AND read_status = false
    AND (
      -- If user is driver, mark owner's messages (from_driver = false) as read
      (v_is_driver AND from_driver = false)
      OR
      -- If user is owner, mark driver's messages (from_driver = true) as read
      (NOT v_is_driver AND from_driver = true)
    );
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- CRITICAL FIX: Only reset the notification timer if we actually marked messages as read
  -- This prevents the sender from accidentally killing the notification timer for the recipient
  IF v_updated_count > 0 THEN
    UPDATE public.chat_notification_state
    SET 
      last_read_at = NOW(),
      notification_timer_active = FALSE,
      first_unread_message_at = NULL,
      notification_count = 0,
      updated_at = NOW()
    WHERE booking_id = p_booking_id;
  END IF;
  
  RETURN v_updated_count;
END;
$$;

-- One-time fix: Reactivate notification timers for bookings that have unread messages
-- but whose timers were incorrectly reset
UPDATE public.chat_notification_state cns
SET 
  notification_timer_active = TRUE,
  first_unread_message_at = (
    SELECT MIN(dom.created_at)
    FROM driver_owner_messages dom
    WHERE dom.booking_id = cns.booking_id
      AND dom.read_status = false
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM driver_owner_messages dom
  WHERE dom.booking_id = cns.booking_id
    AND dom.read_status = false
)
AND (notification_timer_active = FALSE OR first_unread_message_at IS NULL);