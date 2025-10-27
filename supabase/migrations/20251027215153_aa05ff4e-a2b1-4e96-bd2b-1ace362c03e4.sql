-- Update mark_booking_messages_read to also reset notification state

CREATE OR REPLACE FUNCTION public.mark_booking_messages_read(p_booking_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  booking_record RECORD;
  is_driver boolean;
  updated_count integer := 0;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get booking details
  SELECT * INTO booking_record
  FROM public.parking_bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Determine if current user is the driver
  is_driver := (booking_record.user_id = current_user_id);

  -- Mark unread messages as read
  UPDATE public.driver_owner_messages
  SET read_status = true
  WHERE booking_id = p_booking_id
    AND read_status = false
    AND (
      (is_driver AND from_driver = false) OR  -- Driver reading owner messages
      (NOT is_driver AND from_driver = true)  -- Owner reading driver messages
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Reset notification state if messages were marked as read
  IF updated_count > 0 THEN
    UPDATE public.chat_notification_state
    SET 
      last_read_at = NOW(),
      notification_timer_active = FALSE,
      updated_at = NOW()
    WHERE booking_id = p_booking_id;
    
    RAISE LOG 'Cancelled notification timer for booking % after marking % messages as read', p_booking_id, updated_count;
  END IF;
  
  RETURN updated_count;
END;
$$;