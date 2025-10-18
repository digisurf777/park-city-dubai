-- Fix the ambiguous booking_id reference in get_chats_needing_notification
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
    -- FIX: Fully qualify booking_id as dom.booking_id
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
    -- TEMPORARY: 1 minute for testing (normally 5 minutes)
    AND cns.first_unread_message_at < (NOW() - INTERVAL '1 minute')
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

-- Backfill notification state for existing chats with unread messages
INSERT INTO public.chat_notification_state (booking_id, first_unread_message_at, notification_timer_active, updated_at)
SELECT 
  dom.booking_id,
  MIN(dom.created_at) FILTER (WHERE dom.read_status = FALSE) AS first_unread_message_at,
  TRUE AS notification_timer_active,
  NOW()
FROM public.driver_owner_messages dom
LEFT JOIN public.chat_notification_state cns ON cns.booking_id = dom.booking_id
WHERE cns.booking_id IS NULL
  AND EXISTS (
    SELECT 1 
    FROM public.driver_owner_messages dom2 
    WHERE dom2.booking_id = dom.booking_id 
      AND dom2.read_status = FALSE
  )
GROUP BY dom.booking_id
ON CONFLICT (booking_id) DO NOTHING;