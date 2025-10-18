-- Create table to track chat notification state per booking
CREATE TABLE IF NOT EXISTS public.chat_notification_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.parking_bookings(id) ON DELETE CASCADE,
  
  -- Track when first unread message appeared
  first_unread_message_at TIMESTAMPTZ,
  
  -- Track when we last sent a notification email
  last_notification_sent_at TIMESTAMPTZ,
  
  -- Track cooldown period (30 minutes after notification)
  notification_cooldown_until TIMESTAMPTZ,
  
  -- Track when user last marked chat as read
  last_read_at TIMESTAMPTZ,
  
  -- Track if notification timer is active
  notification_timer_active BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_notification_state ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view notification state for their bookings
CREATE POLICY "Users can view their booking notification state"
ON public.chat_notification_state
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND (
          (pl.address = pb.location AND pl.zone = pb.zone)
          OR (pb.location ILIKE '%' || pl.title || '%')
          OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
        )
      )
    )
  )
);

-- Policy: Users can update notification state for their bookings
CREATE POLICY "Users can update their booking notification state"
ON public.chat_notification_state
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND (
          (pl.address = pb.location AND pl.zone = pb.zone)
          OR (pb.location ILIKE '%' || pl.title || '%')
          OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
        )
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND (
          (pl.address = pb.location AND pl.zone = pb.zone)
          OR (pb.location ILIKE '%' || pl.title || '%')
          OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
        )
      )
    )
  )
);

-- Policy: System can insert notification state
CREATE POLICY "System can insert notification state"
ON public.chat_notification_state
FOR INSERT
WITH CHECK (TRUE);

-- Policy: Admins have full access
CREATE POLICY "Admins can manage all notification state"
ON public.chat_notification_state
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create index for efficient queries
CREATE INDEX idx_chat_notification_state_booking_id ON public.chat_notification_state(booking_id);
CREATE INDEX idx_chat_notification_state_timer_active ON public.chat_notification_state(notification_timer_active) WHERE notification_timer_active = TRUE;

-- Function to initialize notification state when first message is sent
CREATE OR REPLACE FUNCTION public.initialize_chat_notification_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notification state if it doesn't exist for this booking
  INSERT INTO public.chat_notification_state (booking_id)
  VALUES (NEW.booking_id)
  ON CONFLICT (booking_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize notification state on first message
CREATE TRIGGER trigger_initialize_notification_state
AFTER INSERT ON public.driver_owner_messages
FOR EACH ROW
EXECUTE FUNCTION public.initialize_chat_notification_state();

-- Function to update notification state when message is inserted
CREATE OR REPLACE FUNCTION public.update_notification_state_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_state RECORD;
BEGIN
  -- Get current notification state
  SELECT * INTO current_state
  FROM public.chat_notification_state
  WHERE booking_id = NEW.booking_id;
  
  IF current_state IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if this is the first unread message (chat was previously read or this is first message)
  IF current_state.first_unread_message_at IS NULL 
     OR current_state.last_read_at > current_state.first_unread_message_at THEN
    -- Start new notification cycle
    UPDATE public.chat_notification_state
    SET 
      first_unread_message_at = NOW(),
      notification_timer_active = TRUE,
      updated_at = NOW()
    WHERE booking_id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update notification state when message is inserted
CREATE TRIGGER trigger_update_notification_state
AFTER INSERT ON public.driver_owner_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_notification_state_on_message();

-- Function to check and send notifications (called by edge function or cron)
CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(
  booking_id UUID,
  driver_id UUID,
  owner_id UUID,
  driver_email TEXT,
  owner_email TEXT,
  first_unread_message_at TIMESTAMPTZ,
  recipient_is_driver BOOLEAN
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
    -- Determine who should receive notification based on last message
    (SELECT from_driver FROM public.driver_owner_messages 
     WHERE booking_id = cns.booking_id 
     ORDER BY created_at DESC LIMIT 1) AS recipient_is_driver
  FROM public.chat_notification_state cns
  JOIN public.parking_bookings pb ON pb.id = cns.booking_id
  LEFT JOIN public.profiles dp ON dp.user_id = pb.user_id
  LEFT JOIN auth.users da ON da.id = pb.user_id
  LEFT JOIN public.profiles op ON op.user_id = get_booking_owner_id(pb.id)
  LEFT JOIN auth.users oa ON oa.id = get_booking_owner_id(pb.id)
  WHERE 
    -- Timer is active
    cns.notification_timer_active = TRUE
    -- 5 minutes have passed since first unread message
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