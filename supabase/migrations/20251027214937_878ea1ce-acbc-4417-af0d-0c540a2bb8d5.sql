-- Fix and enhance chat notification functions (with proper drop order)

-- Drop trigger first, then function
DROP TRIGGER IF EXISTS trigger_update_notification_state ON public.driver_owner_messages;
DROP FUNCTION IF EXISTS public.update_notification_state_on_message();

-- Drop and recreate get_chats_needing_notification with enhanced data
DROP FUNCTION IF EXISTS public.get_chats_needing_notification();

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
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cns.booking_id,
    pb.user_id as driver_id,
    public.get_booking_owner_id(cns.booking_id) as owner_id,
    driver_profile.email as driver_email,
    owner_profile.email as owner_email,
    cns.first_unread_message_at,
    -- Recipient is the one who HASN'T sent the last message
    NOT (latest_msg.from_driver) as recipient_is_driver,
    -- Sender name (opposite of recipient)
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(driver_profile.full_name, 'Driver')
      ELSE COALESCE(owner_profile.full_name, 'Owner')
    END as sender_name,
    -- Message preview (first 100 characters)
    LEFT(latest_msg.message_text, 100) as latest_message_preview,
    pb.location as booking_location,
    pb.zone as booking_zone,
    -- Recipient name
    CASE 
      WHEN latest_msg.from_driver THEN COALESCE(owner_profile.full_name, 'Owner')
      ELSE COALESCE(driver_profile.full_name, 'Driver')
    END as recipient_name
  FROM public.chat_notification_state cns
  INNER JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  INNER JOIN (
    -- Get the latest unread message for each booking
    SELECT DISTINCT ON (booking_id)
      booking_id,
      from_driver,
      message as message_text,
      created_at
    FROM public.driver_owner_messages
    WHERE read_status = false
    ORDER BY booking_id, created_at DESC
  ) latest_msg ON latest_msg.booking_id = cns.booking_id
  LEFT JOIN public.profiles driver_profile ON driver_profile.user_id = pb.user_id
  LEFT JOIN public.profiles owner_profile ON owner_profile.user_id = public.get_booking_owner_id(cns.booking_id)
  WHERE 
    cns.notification_timer_active = TRUE
    AND cns.first_unread_message_at IS NOT NULL
    AND cns.first_unread_message_at < (NOW() - INTERVAL '5 minutes')
    AND (cns.notification_cooldown_until IS NULL OR cns.notification_cooldown_until < NOW())
    AND pb.status IN ('confirmed', 'approved');
END;
$$;

-- Recreate the update_notification_state_on_message trigger function
CREATE OR REPLACE FUNCTION public.update_notification_state_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_state RECORD;
BEGIN
  -- Get current notification state
  SELECT * INTO current_state
  FROM public.chat_notification_state
  WHERE booking_id = NEW.booking_id;
  
  IF current_state IS NULL THEN
    -- Create notification state if it doesn't exist
    INSERT INTO public.chat_notification_state (booking_id)
    VALUES (NEW.booking_id);
    
    -- Get the newly created state
    SELECT * INTO current_state
    FROM public.chat_notification_state
    WHERE booking_id = NEW.booking_id;
  END IF;
  
  -- Only activate timer for unread messages
  IF NEW.read_status = false THEN
    -- Check if this is the first unread message (chat was previously read or this is first message)
    IF current_state.first_unread_message_at IS NULL 
       OR current_state.last_read_at > current_state.first_unread_message_at 
       OR (current_state.notification_cooldown_until IS NOT NULL AND current_state.notification_cooldown_until < NOW()) THEN
      -- Start new notification cycle
      UPDATE public.chat_notification_state
      SET 
        first_unread_message_at = NOW(),
        notification_timer_active = TRUE,
        updated_at = NOW()
      WHERE booking_id = NEW.booking_id;
      
      RAISE LOG 'Chat notification timer activated for booking %', NEW.booking_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_notification_state_on_message_trigger
  AFTER INSERT ON public.driver_owner_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_state_on_message();

-- Add function to mark messages as read and reset notification state
CREATE OR REPLACE FUNCTION public.mark_chat_messages_read(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update notification state to reflect messages were read
  UPDATE public.chat_notification_state
  SET 
    last_read_at = NOW(),
    notification_timer_active = FALSE,
    updated_at = NOW()
  WHERE booking_id = p_booking_id;
END;
$$;