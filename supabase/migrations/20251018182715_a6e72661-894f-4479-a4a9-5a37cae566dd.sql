-- Fix mark_booking_messages_read to cancel notification timer only when messages are actually read
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

  -- Verify access
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

  -- Mark messages as read (only messages from the other party)
  UPDATE public.driver_owner_messages
  SET read_status = true, updated_at = now()
  WHERE booking_id = p_booking_id
    AND read_status = false
    AND (
      (is_driver AND from_driver = false) OR
      (NOT is_driver AND from_driver = true)
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Only cancel notification timer if we actually marked messages as read
  IF updated_count > 0 THEN
    UPDATE public.chat_notification_state
    SET 
      last_read_at = now(),
      notification_timer_active = false,
      updated_at = now()
    WHERE booking_id = p_booking_id;
    
    RAISE LOG 'Cancelled notification timer for booking % after marking % messages as read', p_booking_id, updated_count;
  END IF;
  
  RETURN updated_count;
END;$$;

-- Change notification timer from 1 minute (test) to 5 minutes (production)
CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(
  booking_id uuid,
  driver_id uuid,
  owner_id uuid,
  driver_email text,
  owner_email text,
  first_unread_message_at timestamp with time zone,
  recipient_is_driver boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cns.booking_id,
    pb.user_id AS driver_id,
    get_booking_owner_id(pb.id) AS owner_id,
    COALESCE(dp.email, da.email) AS driver_email,
    COALESCE(op.email, oa.email) AS owner_email,
    cns.first_unread_message_at,
    -- Determine who should receive notification based on last message
    (SELECT dom.from_driver 
     FROM public.driver_owner_messages dom
     WHERE dom.booking_id = cns.booking_id 
     ORDER BY dom.created_at DESC 
     LIMIT 1) AS recipient_is_driver
  FROM public.chat_notification_state cns
  JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  LEFT JOIN public.profiles dp ON dp.user_id = pb.user_id
  LEFT JOIN auth.users da ON da.id = pb.user_id
  LEFT JOIN public.profiles op ON op.user_id = get_booking_owner_id(pb.id)
  LEFT JOIN auth.users oa ON oa.id = get_booking_owner_id(pb.id)
  WHERE 
    -- Timer is active
    cns.notification_timer_active = TRUE
    -- Production: 5 minutes (not 1 minute test value)
    AND cns.first_unread_message_at < (NOW() - INTERVAL '5 minutes')
    -- Not in cooldown period
    AND (cns.notification_cooldown_until IS NULL OR cns.notification_cooldown_until < NOW())
    -- Has unread messages
    AND EXISTS (
      SELECT 1 FROM public.driver_owner_messages dom
      WHERE dom.booking_id = cns.booking_id
      AND dom.read_status = FALSE
      AND dom.created_at >= cns.first_unread_message_at
    );
END;
$$;