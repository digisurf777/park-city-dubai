CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
 RETURNS TABLE(
   booking_id uuid, 
   driver_id uuid, 
   owner_id uuid, 
   driver_email text, 
   owner_email text, 
   first_unread_message_at timestamp with time zone, 
   recipient_is_driver boolean, 
   sender_name text, 
   latest_message_preview text, 
   booking_location text, 
   booking_zone text, 
   recipient_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cns.booking_id,
    pb.user_id as driver_id,
    public.get_booking_owner_id(cns.booking_id) as owner_id,
    driver_profile.email as driver_email,
    owner_profile.email as owner_email,
    cns.first_unread_message_at,
    NOT (latest_msg.from_driver) as recipient_is_driver,
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(driver_profile.full_name, 'Driver')
      ELSE COALESCE(owner_profile.full_name, 'Owner')
    END as sender_name,
    LEFT(latest_msg.message_text, 100) as latest_message_preview,
    pb.location as booking_location,
    pb.zone as booking_zone,
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(owner_profile.full_name, 'Owner')
      ELSE COALESCE(driver_profile.full_name, 'Driver')
    END as recipient_name
  FROM public.chat_notification_state cns
  INNER JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  INNER JOIN (
    SELECT DISTINCT ON (dom.booking_id)
      dom.booking_id,
      dom.from_driver,
      dom.message as message_text,
      dom.created_at
    FROM public.driver_owner_messages dom
    WHERE dom.read_status = false
    ORDER BY dom.booking_id, dom.created_at DESC
  ) latest_msg ON latest_msg.booking_id = cns.booking_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = pb.user_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = public.get_booking_owner_id(cns.booking_id)
  WHERE 
    -- Key change: check for unread messages that need notification
    cns.first_unread_message_at IS NOT NULL
    -- Wait 3 minutes before notifying
    AND cns.first_unread_message_at < (NOW() - INTERVAL '3 minutes')
    -- Either: timer is active (new notification cycle)
    -- OR: cooldown expired and message still unread (follow-up notification)
    AND (
      cns.notification_timer_active = TRUE
      OR (
        cns.notification_cooldown_until IS NOT NULL 
        AND cns.notification_cooldown_until < NOW()
        AND (cns.last_read_at IS NULL OR cns.last_read_at < cns.first_unread_message_at)
      )
    )
    -- Only for active bookings
    AND pb.status IN ('confirmed', 'approved')
    -- Booking hasn't expired yet
    AND pb.end_time > NOW();
END;
$function$;