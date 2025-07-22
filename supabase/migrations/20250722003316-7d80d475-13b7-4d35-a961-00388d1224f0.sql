-- Modify driver_owner_messages table to link to bookings and add monitoring
ALTER TABLE public.driver_owner_messages 
ADD COLUMN booking_id UUID REFERENCES public.parking_bookings(id) ON DELETE CASCADE,
ADD COLUMN is_expired BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN contains_violation BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN admin_flagged BOOLEAN NOT NULL DEFAULT false;

-- Drop the old listing_id constraint and make booking_id required
ALTER TABLE public.driver_owner_messages 
ALTER COLUMN listing_id DROP NOT NULL,
ALTER COLUMN booking_id SET NOT NULL;

-- Update RLS policies for booking-based access
DROP POLICY "Drivers can view messages for their conversations" ON public.driver_owner_messages;
DROP POLICY "Drivers can create messages in their conversations" ON public.driver_owner_messages;
DROP POLICY "Users can update read status of messages directed to them" ON public.driver_owner_messages;

-- New policies for booking-based chat
CREATE POLICY "Users can view messages for their bookings"
ON public.driver_owner_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = booking_id 
    AND (pb.user_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM public.parking_listings pl 
           WHERE pl.id = pb.id AND pl.owner_id = auth.uid()
         ))
  )
);

CREATE POLICY "Users can create messages for active bookings only"
ON public.driver_owner_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = booking_id 
    AND pb.status = 'confirmed'
    AND pb.start_time <= now()
    AND pb.end_time >= now()
    AND (pb.user_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM public.parking_listings pl 
           WHERE pl.id = pb.id AND pl.owner_id = auth.uid()
         ))
  )
  AND NOT is_expired
);

CREATE POLICY "Users can update read status of their booking messages"
ON public.driver_owner_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = booking_id 
    AND (pb.user_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM public.parking_listings pl 
           WHERE pl.id = pb.id AND pl.owner_id = auth.uid()
         ))
  )
);

-- Function to automatically expire chats when bookings end
CREATE OR REPLACE FUNCTION public.expire_booking_chats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.driver_owner_messages 
  SET is_expired = true
  WHERE booking_id IN (
    SELECT id FROM public.parking_bookings 
    WHERE end_time < now() AND status IN ('confirmed', 'completed')
  )
  AND NOT is_expired;
END;
$$;

-- Create a trigger to automatically expire chats
CREATE OR REPLACE FUNCTION public.check_booking_expiry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If booking is completed or ended, expire associated chats
  IF NEW.status = 'completed' OR NEW.end_time < now() THEN
    UPDATE public.driver_owner_messages 
    SET is_expired = true
    WHERE booking_id = NEW.id AND NOT is_expired;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_expire_chats_on_booking_update
AFTER UPDATE ON public.parking_bookings
FOR EACH ROW
EXECUTE FUNCTION public.check_booking_expiry();