-- Fix chat notification state initialization for all scenarios
-- This migration:
-- 1. Manually fixes existing approved/confirmed bookings to enable chat immediately
-- 2. Updates trigger to handle both INSERT and UPDATE cases for future bookings

-- Step 1: Manually insert chat notification state for any approved/confirmed bookings that don't have it
INSERT INTO public.chat_notification_state (
  booking_id,
  notification_timer_active,
  last_read_at,
  created_at,
  updated_at
)
SELECT 
  pb.id,
  FALSE,
  NOW(),
  NOW(),
  NOW()
FROM public.parking_bookings pb
LEFT JOIN public.chat_notification_state cns ON cns.booking_id = pb.id
WHERE 
  pb.status IN ('confirmed', 'approved')
  AND cns.booking_id IS NULL
ON CONFLICT (booking_id) DO NOTHING;

-- Step 2: Update the trigger function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.initialize_chat_on_booking_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Handle both INSERT and UPDATE cases
  -- For INSERT: Check if booking is created with confirmed/approved status
  -- For UPDATE: Check if status changed to confirmed/approved
  IF NEW.status IN ('confirmed', 'approved') THEN
    -- For UPDATE, ensure this is a new approval (status changed)
    -- For INSERT, OLD will be NULL
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.status IS NULL OR OLD.status != NEW.status)) THEN
      -- Insert notification state if it doesn't exist for this booking
      INSERT INTO public.chat_notification_state (
        booking_id,
        notification_timer_active,
        last_read_at,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        FALSE,
        NOW(), -- Set initial read time to now
        NOW(),
        NOW()
      )
      ON CONFLICT (booking_id) DO NOTHING;
      
      RAISE LOG 'Chat notification state initialized for booking % via %', NEW.id, TG_OP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 3: Drop old triggers and create new ones for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_initialize_chat_on_approval ON public.parking_bookings;
DROP TRIGGER IF EXISTS trigger_initialize_chat_on_approval_update ON public.parking_bookings;
DROP TRIGGER IF EXISTS trigger_initialize_chat_on_approval_insert ON public.parking_bookings;

-- Create trigger for UPDATE operations (status changes)
CREATE TRIGGER trigger_initialize_chat_on_approval_update
AFTER UPDATE ON public.parking_bookings
FOR EACH ROW
EXECUTE FUNCTION public.initialize_chat_on_booking_approval();

-- Create trigger for INSERT operations (direct approvals)
CREATE TRIGGER trigger_initialize_chat_on_approval_insert
AFTER INSERT ON public.parking_bookings
FOR EACH ROW
EXECUTE FUNCTION public.initialize_chat_on_booking_approval();

COMMENT ON FUNCTION public.initialize_chat_on_booking_approval() IS 'Automatically initializes chat notification state when a booking is approved or confirmed (on insert or update), making the chat immediately available to drivers and owners';