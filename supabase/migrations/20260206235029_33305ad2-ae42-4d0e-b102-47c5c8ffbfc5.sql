
-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS public.get_chats_needing_notification();

-- Recreate with simplified escalation schedule
CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(
  booking_id uuid,
  driver_id uuid,
  owner_id uuid,
  driver_email text,
  owner_email text,
  recipient_is_driver boolean,
  recipient_name text,
  sender_name text,
  first_unread_message_at timestamptz,
  latest_message_preview text,
  notification_count integer,
  booking_location text,
  booking_zone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH unread_chats AS (
    SELECT DISTINCT ON (m.booking_id, (NOT m.from_driver))
      m.booking_id,
      m.driver_id,
      m.owner_id,
      m.from_driver,
      m.message,
      m.created_at
    FROM driver_owner_messages m
    WHERE m.read_status = false
      AND m.is_expired = false
    ORDER BY m.booking_id, (NOT m.from_driver), m.created_at DESC
  )
  SELECT
    uc.booking_id,
    uc.driver_id,
    uc.owner_id,
    dp.email AS driver_email,
    op.email AS owner_email,
    (NOT uc.from_driver) AS recipient_is_driver,
    CASE WHEN uc.from_driver THEN op.full_name ELSE dp.full_name END AS recipient_name,
    CASE WHEN uc.from_driver THEN dp.full_name ELSE op.full_name END AS sender_name,
    cns.first_unread_message_at,
    LEFT(uc.message, 100) AS latest_message_preview,
    COALESCE(cns.notification_count, 0)::integer AS notification_count,
    pb.location AS booking_location,
    pb.zone AS booking_zone
  FROM unread_chats uc
  JOIN profiles dp ON dp.user_id = uc.driver_id
  JOIN profiles op ON op.user_id = uc.owner_id
  JOIN parking_bookings pb ON pb.id = uc.booking_id
  LEFT JOIN chat_notification_state cns ON cns.booking_id = uc.booking_id
  WHERE
    -- Timer must be active
    COALESCE(cns.notification_timer_active, true) = true
    -- 7-day cutoff: stop notifications after 7 days of no response
    AND cns.first_unread_message_at > NOW() - INTERVAL '7 days'
    -- Simplified escalation:
    -- Phase 1 (count = 0): first reminder 5 min after first unread message
    -- Phase 2 (count >= 1): one reminder every 24 hours
    AND (
      (COALESCE(cns.notification_count, 0) = 0
        AND cns.first_unread_message_at < NOW() - INTERVAL '5 minutes')
      OR
      (COALESCE(cns.notification_count, 0) >= 1
        AND cns.last_notification_sent_at < NOW() - INTERVAL '24 hours')
    );
END;
$$;
