-- Remove the system message from chat creation and enable immediate chat access

-- 1. Update the trigger to not create the initial system message
CREATE OR REPLACE FUNCTION public.create_chat_thread_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- No longer creating initial system message
  -- Chat will be enabled immediately when booking is approved
  -- Users can start messaging right away
  RETURN NEW;
END;
$function$;

-- 2. Update RLS policy to allow messages immediately when booking is approved (not just 48 hours before)
DROP POLICY IF EXISTS "Users can create messages 48 hours before booking start" ON public.driver_owner_messages;

CREATE POLICY "Users can create messages when booking is approved"
ON public.driver_owner_messages
FOR INSERT
WITH CHECK (
  NOT is_expired 
  AND EXISTS (
    SELECT 1
    FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
    AND pb.status IN ('confirmed', 'approved')
    AND now() <= pb.end_time  -- Chat available until booking ends
    AND (
      -- User is the driver
      pb.user_id = auth.uid()
      OR 
      -- User is the owner of the listing
      EXISTS (
        SELECT 1
        FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND (
          -- Exact match
          (pl.address = pb.location AND pl.zone = pb.zone)
          OR 
          -- Booking location contains listing title
          (pb.location ILIKE '%' || pl.title || '%')
          OR
          -- Address match with generic zone
          (pl.address = pb.location AND pb.zone = 'Find Parking Page')
        )
      )
    )
  )
);