-- Update RLS policy for driver_owner_messages to allow chat 48 hours before booking start
DROP POLICY IF EXISTS "Users can create messages for active bookings only" ON public.driver_owner_messages;

CREATE POLICY "Users can create messages for chat window period" 
ON public.driver_owner_messages 
FOR INSERT 
WITH CHECK (
  (EXISTS (
    SELECT 1
    FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id 
      AND pb.status = 'confirmed'::text 
      AND now() >= (pb.start_time - interval '48 hours')  -- 48 hours before start
      AND now() <= (pb.end_time + interval '48 hours')    -- 48 hours after end
      AND (
        (pb.user_id = auth.uid()) OR 
        (EXISTS (
          SELECT 1
          FROM parking_listings pl
          WHERE pl.id = pb.id AND pl.owner_id = auth.uid()
        ))
      )
  )) 
  AND (NOT is_expired)
);