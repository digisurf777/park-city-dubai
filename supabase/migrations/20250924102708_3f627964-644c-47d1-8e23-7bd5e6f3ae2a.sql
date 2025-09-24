-- Update RLS policy to allow chat access 48 hours before booking start
DROP POLICY IF EXISTS "Users can create messages from booking start onwards" ON public.driver_owner_messages;

-- Create new policy that allows chat 48 hours before booking start
CREATE POLICY "Users can create messages 48 hours before booking start" 
ON public.driver_owner_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id 
    AND pb.status IN ('confirmed', 'approved')
    AND (
      -- Chat becomes active 48 hours before start time
      now() >= (pb.start_time - interval '48 hours')
      OR 
      -- Or if booking is currently active
      (now() >= pb.start_time AND now() <= pb.end_time)
    )
    AND (
      -- User is either the booking user or the listing owner
      pb.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM parking_listings pl 
        WHERE pl.address = pb.location 
        AND pl.zone = pb.zone 
        AND pl.owner_id = auth.uid()
      )
    )
  ) 
  AND NOT is_expired
);

-- Update the view policy to match
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON public.driver_owner_messages;

CREATE POLICY "Users can view messages for their bookings" 
ON public.driver_owner_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id 
    AND (
      -- User is either the booking user or the listing owner
      pb.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM parking_listings pl 
        WHERE pl.address = pb.location 
        AND pl.zone = pb.zone 
        AND pl.owner_id = auth.uid()
      )
    )
  )
);

-- Create trigger to automatically create chat threads when bookings are confirmed
CREATE OR REPLACE FUNCTION public.create_chat_thread_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  listing_owner_id UUID;
BEGIN
  -- Only create chat thread when booking is confirmed/approved
  IF NEW.status IN ('confirmed', 'approved') AND (OLD.status IS NULL OR OLD.status != NEW.status) THEN
    -- Find the listing owner
    SELECT pl.owner_id INTO listing_owner_id
    FROM public.parking_listings pl
    WHERE pl.address = NEW.location 
    AND pl.zone = NEW.zone
    AND pl.status IN ('approved', 'published')
    LIMIT 1;

    -- Insert initial system message to create the chat thread
    IF listing_owner_id IS NOT NULL THEN
      INSERT INTO public.driver_owner_messages (
        booking_id,
        driver_id,
        owner_id,
        message,
        from_driver,
        is_expired
      ) VALUES (
        NEW.id,
        NEW.user_id,
        listing_owner_id,
        'Chat thread created for booking. Communication will be available 48 hours before your booking start time.',
        false, -- System message
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS create_chat_thread_trigger ON public.parking_bookings;
CREATE TRIGGER create_chat_thread_trigger
  AFTER INSERT OR UPDATE ON public.parking_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_chat_thread_on_booking();