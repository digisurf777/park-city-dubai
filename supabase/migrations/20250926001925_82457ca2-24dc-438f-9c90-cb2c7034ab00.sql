-- Fix existing messages with incorrect owner_id
-- Update driver_owner_messages to have correct owner_id based on the actual listing owner

UPDATE public.driver_owner_messages 
SET owner_id = public.get_booking_owner_id(booking_id)
WHERE owner_id = driver_id  -- Only update messages where owner_id equals driver_id (incorrect data)
AND EXISTS (
  SELECT 1 
  FROM public.parking_bookings pb 
  WHERE pb.id = driver_owner_messages.booking_id
);