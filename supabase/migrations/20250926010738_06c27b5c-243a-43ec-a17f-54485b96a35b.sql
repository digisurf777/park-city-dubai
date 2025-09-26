-- Update RLS policies on driver_owner_messages to allow owners to read/respond with flexible listing matching
-- 1) Drop existing policies
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON public.driver_owner_messages;
DROP POLICY IF EXISTS "Users can update read status of their booking messages" ON public.driver_owner_messages;
DROP POLICY IF EXISTS "Users can create messages 48 hours before booking start" ON public.driver_owner_messages;

-- 2) Recreate policies with enhanced owner matching logic
-- Helper condition for owner matching reused in all policies
-- Owner can access messages for bookings that match their listing by:
--   a) exact address+zone, OR
--   b) booking location containing listing title, OR
--   c) exact address with booking zone='Find Parking Page'
-- And listing must be approved/published

-- SELECT: users can view messages for their bookings (driver or owner)
CREATE POLICY "Users can view messages for their bookings" 
ON public.driver_owner_messages
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
      AND (
        pb.user_id = auth.uid() -- driver
        OR EXISTS (
          SELECT 1 FROM public.parking_listings pl
          WHERE pl.owner_id = auth.uid()
            AND pl.status IN ('approved','published')
            AND (
              (pl.address = pb.location AND pl.zone = pb.zone)
              OR (pb.location ILIKE '%' || pl.title || '%')
              OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
            )
        )
      )
  )
);

-- UPDATE: users can mark messages as read (driver or owner)
CREATE POLICY "Users can update read status of their booking messages" 
ON public.driver_owner_messages
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
      AND (
        pb.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.parking_listings pl
          WHERE pl.owner_id = auth.uid()
            AND pl.status IN ('approved','published')
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
  -- allow updating read_status only; but we cannot restrict columns in policy, so rely on UI to only update read_status
  TRUE
);

-- INSERT: users can create messages (driver or owner) within chat window
CREATE POLICY "Users can create messages 48 hours before booking start" 
ON public.driver_owner_messages
FOR INSERT 
WITH CHECK (
  NOT is_expired AND EXISTS (
    SELECT 1 FROM public.parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
      AND pb.status IN ('confirmed','approved')
      AND (
        (now() >= (pb.start_time - INTERVAL '48 hours') AND now() <= pb.end_time)
        OR (now() >= pb.start_time AND now() <= pb.end_time)
      )
      AND (
        pb.user_id = auth.uid() -- driver
        OR EXISTS (
          SELECT 1 FROM public.parking_listings pl
          WHERE pl.owner_id = auth.uid()
            AND pl.status IN ('approved','published')
            AND (
              (pl.address = pb.location AND pl.zone = pb.zone)
              OR (pb.location ILIKE '%' || pl.title || '%')
              OR (pl.address = pb.location AND pb.zone = 'Find Parking Page')
            )
        )
      )
  )
);
