-- Add notification count tracking column
ALTER TABLE chat_notification_state 
ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 0;

-- Update function to limit notifications with smart escalation
-- Max 3 in first hour, then once daily, stop after 7 days
CREATE OR REPLACE FUNCTION get_chats_needing_notification()
RETURNS TABLE (
  booking_id UUID,
  driver_id UUID,
  owner_id UUID,
  driver_email TEXT,
  owner_email TEXT,
  first_unread_message_at TIMESTAMPTZ,
  recipient_is_driver BOOLEAN,
  sender_name TEXT,
  latest_message_preview TEXT,
  booking_location TEXT,
  booking_zone TEXT,
  recipient_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (dom.booking_id)
      dom.booking_id,
      dom.from_driver,
      dom.message,
      dom.created_at
    FROM driver_owner_messages dom
    WHERE dom.read_status = false
      AND dom.is_expired = false
    ORDER BY dom.booking_id, dom.created_at DESC
  ),
  eligible_chats AS (
    SELECT 
      cns.booking_id,
      cns.first_unread_message_at,
      cns.notification_count,
      cns.last_notification_sent_at,
      lm.from_driver,
      lm.message,
      pb.user_id as driver_id,
      pb.location,
      pb.zone,
      pl.owner_id
    FROM chat_notification_state cns
    INNER JOIN latest_messages lm ON lm.booking_id = cns.booking_id
    INNER JOIN parking_bookings pb ON pb.id = cns.booking_id
    INNER JOIN parking_listings pl ON pl.id = pb.listing_id
    WHERE 
      -- Timer must be active
      cns.notification_timer_active = true
      -- Must have unread message
      AND cns.first_unread_message_at IS NOT NULL
      -- Booking must be active
      AND pb.status IN ('confirmed', 'approved')
      AND pb.end_time > NOW()
      -- Stop after 7 days of no response
      AND cns.first_unread_message_at > NOW() - INTERVAL '7 days'
      -- Cooldown must have passed
      AND (cns.notification_cooldown_until IS NULL OR cns.notification_cooldown_until <= NOW())
      -- Notification limiting logic:
      -- First 3 notifications: every 15 minutes (standard cooldown)
      -- After 3 notifications: once per 24 hours
      AND (
        -- Allow if under 3 notifications (standard cooldown applies via notification_cooldown_until)
        COALESCE(cns.notification_count, 0) < 3
        OR
        -- After 3 notifications, only allow once per 24 hours
        (
          COALESCE(cns.notification_count, 0) >= 3
          AND (
            cns.last_notification_sent_at IS NULL 
            OR cns.last_notification_sent_at < NOW() - INTERVAL '24 hours'
          )
        )
      )
      -- Initial delay: first notification after 3 minutes
      AND cns.first_unread_message_at <= NOW() - INTERVAL '3 minutes'
  )
  SELECT 
    ec.booking_id,
    ec.driver_id,
    ec.owner_id,
    driver_profile.email as driver_email,
    owner_profile.email as owner_email,
    ec.first_unread_message_at,
    ec.from_driver as recipient_is_driver, -- If message is FROM driver, recipient is owner (false means owner receives)
    CASE 
      WHEN ec.from_driver THEN COALESCE(driver_profile.full_name, 'Driver')
      ELSE COALESCE(owner_profile.full_name, 'Owner')
    END as sender_name,
    LEFT(ec.message, 150) as latest_message_preview,
    ec.location as booking_location,
    ec.zone as booking_zone,
    CASE 
      WHEN ec.from_driver THEN COALESCE(owner_profile.full_name, 'there')
      ELSE COALESCE(driver_profile.full_name, 'there')
    END as recipient_name
  FROM eligible_chats ec
  LEFT JOIN profiles driver_profile ON driver_profile.user_id = ec.driver_id
  LEFT JOIN profiles owner_profile ON owner_profile.user_id = ec.owner_id;
END;
$$;