-- Create trigger to initialize chat notification state when booking is approved
-- This ensures the chat is immediately available after approval

CREATE OR REPLACE FUNCTION public.initialize_chat_on_booking_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When booking status changes to 'confirmed' or 'approved', initialize chat notification state
  IF NEW.status IN ('confirmed', 'approved') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    -- Insert notification state if it doesn't exist for this booking
    INSERT INTO public.chat_notification_state (
      booking_id,
      notification_timer_active,
      updated_at
    )
    VALUES (
      NEW.id,
      FALSE,
      NOW()
    )
    ON CONFLICT (booking_id) DO NOTHING;
    
    RAISE LOG 'Chat notification state initialized for booking %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_initialize_chat_on_approval ON public.parking_bookings;

CREATE TRIGGER trigger_initialize_chat_on_approval
AFTER UPDATE ON public.parking_bookings
FOR EACH ROW
EXECUTE FUNCTION public.initialize_chat_on_booking_approval();

COMMENT ON FUNCTION public.initialize_chat_on_booking_approval() IS 'Automatically initializes chat notification state when a booking is approved or confirmed, making the chat immediately available to drivers and owners';