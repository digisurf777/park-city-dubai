-- Fix recipient selection bug: recipient_is_driver should be TRUE when the last message was sent by the owner (from_driver = FALSE)
-- and FALSE when the last message was sent by the driver (from_driver = TRUE)

CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(
  booking_id uuid,
  driver_id uuid,
  owner_id uuid,
  driver_email text,
  owner_email text,
  first_unread_message_at timestamptz,
  recipient_is_driver boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Recipient is the opposite of who sent the last message
    NOT (
      SELECT dom.from_driver 
      FROM public.driver_owner_messages dom
      WHERE dom.booking_id = cns.booking_id 
      ORDER BY dom.created_at DESC 
      LIMIT 1
    ) AS recipient_is_driver
  FROM public.chat_notification_state cns
  JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  LEFT JOIN public.profiles dp ON dp.user_id = pb.user_id
  LEFT JOIN auth.users da ON da.id = pb.user_id
  LEFT JOIN public.profiles op ON op.user_id = get_booking_owner_id(pb.id)
  LEFT JOIN auth.users oa ON oa.id = get_booking_owner_id(pb.id)
  WHERE 
    cns.notification_timer_active = TRUE
    AND cns.first_unread_message_at < (NOW() - INTERVAL '5 minutes')
    AND (cns.notification_cooldown_until IS NULL OR cns.notification_cooldown_until < NOW())
    AND EXISTS (
      SELECT 1 FROM public.driver_owner_messages dom
      WHERE dom.booking_id = cns.booking_id
      AND dom.read_status = FALSE
      AND dom.created_at >= cns.first_unread_message_at
    );
END;
$$;