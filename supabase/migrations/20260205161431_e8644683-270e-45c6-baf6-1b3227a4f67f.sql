-- Drop existing function and recreate with new return type (includes notification_count)
DROP FUNCTION IF EXISTS public.get_chats_needing_notification();

-- Recreate with escalation schedule logic:
-- - 1st reminder at T+3 min (notification_count = 0 -> 1)
-- - 2nd reminder at T+18 min (notification_count = 1 -> 2)
-- - 3rd reminder at T+33 min (notification_count = 2 -> 3)
-- - After 3rd: once every 24 hours
-- - After 7 days: stop completely

CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(
  booking_id uuid,
  driver_id uuid,
  owner_id uuid,
  driver_email text,
  owner_email text,
  first_unread_message_at timestamptz,
  recipient_is_driver boolean,
  sender_name text,
  latest_message_preview text,
  booking_location text,
  booking_zone text,
  recipient_name text,
  notification_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cns.booking_id,
    pb.user_id as driver_id,
    pl.owner_id,
    driver_profile.email as driver_email,
    owner_profile.email as owner_email,
    cns.first_unread_message_at,
    -- Determine who should receive the notification (who hasn't read messages)
    -- Look at the most recent message and determine if recipient is driver or owner
    (
      SELECT dom.from_driver
      FROM driver_owner_messages dom
      WHERE dom.booking_id = cns.booking_id
      ORDER BY dom.created_at DESC
      LIMIT 1
    ) = false as recipient_is_driver,  -- If from_driver=false (owner sent), driver is recipient
    -- Get sender name
    CASE 
      WHEN (SELECT dom.from_driver FROM driver_owner_messages dom WHERE dom.booking_id = cns.booking_id ORDER BY dom.created_at DESC LIMIT 1) = true 
      THEN COALESCE(driver_profile.full_name, 'Driver')
      ELSE COALESCE(owner_profile.full_name, 'Owner')
    END as sender_name,
    -- Get latest message preview
    (
      SELECT LEFT(dom.message, 100)
      FROM driver_owner_messages dom
      WHERE dom.booking_id = cns.booking_id
      ORDER BY dom.created_at DESC
      LIMIT 1
    ) as latest_message_preview,
    pb.location as booking_location,
    pb.zone as booking_zone,
    -- Get recipient name
    CASE 
      WHEN (SELECT dom.from_driver FROM driver_owner_messages dom WHERE dom.booking_id = cns.booking_id ORDER BY dom.created_at DESC LIMIT 1) = true 
      THEN COALESCE(owner_profile.full_name, 'Owner')
      ELSE COALESCE(driver_profile.full_name, 'Driver')
    END as recipient_name,
    COALESCE(cns.notification_count, 0)::integer as notification_count
  FROM public.chat_notification_state cns
  JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  JOIN public.parking_listings pl ON pl.id = pb.listing_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = pb.user_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = pl.owner_id
  WHERE 
    -- Timer must be active
    cns.notification_timer_active = TRUE
    -- Must have a first unread timestamp
    AND cns.first_unread_message_at IS NOT NULL
    -- Stop after 7 days of no response
    AND cns.first_unread_message_at > (NOW() - INTERVAL '7 days')
    -- Only active bookings
    AND pb.status IN ('confirmed', 'approved')
    -- Escalation logic
    AND (
      -- Phase 1: First 3 reminders (count 0, 1, 2)
      (COALESCE(cns.notification_count, 0) < 3 AND (
        -- 1st reminder: 3 minutes after first unread message
        (COALESCE(cns.notification_count, 0) = 0 AND cns.first_unread_message_at < NOW() - INTERVAL '3 minutes')
        -- 2nd reminder: 15 minutes after 1st (T+18 min total)
        OR (cns.notification_count = 1 AND cns.last_notification_sent_at < NOW() - INTERVAL '15 minutes')
        -- 3rd reminder: 15 minutes after 2nd (T+33 min total)
        OR (cns.notification_count = 2 AND cns.last_notification_sent_at < NOW() - INTERVAL '15 minutes')
      ))
      -- Phase 2: After 3 reminders, once every 24 hours
      OR (COALESCE(cns.notification_count, 0) >= 3 AND cns.last_notification_sent_at < NOW() - INTERVAL '24 hours')
    );
END;
$$;