-- Fix RLS policies to use exact listing_id matching instead of fuzzy string matching
-- This prevents cross-listing access when multiple listings exist in the same building

-- Drop existing problematic policies on driver_owner_messages
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON driver_owner_messages;
DROP POLICY IF EXISTS "Users can create messages when booking is approved" ON driver_owner_messages;
DROP POLICY IF EXISTS "Users can update read status of their booking messages" ON driver_owner_messages;

-- Drop existing problematic policies on chat_notification_state
DROP POLICY IF EXISTS "Users can view their booking notification state" ON chat_notification_state;
DROP POLICY IF EXISTS "Users can update their booking notification state" ON chat_notification_state;

-- Recreate driver_owner_messages policies with exact listing_id matching
CREATE POLICY "Users can view messages for their bookings"
ON driver_owner_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
);

CREATE POLICY "Users can create messages when booking is approved"
ON driver_owner_messages
FOR INSERT
WITH CHECK (
  NOT is_expired
  AND EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
    AND pb.status IN ('confirmed', 'approved')
    AND now() <= pb.end_time
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
);

CREATE POLICY "Users can update read status of their booking messages"
ON driver_owner_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = driver_owner_messages.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
)
WITH CHECK (true);

-- Recreate chat_notification_state policies with exact listing_id matching
CREATE POLICY "Users can view their booking notification state"
ON chat_notification_state
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
);

CREATE POLICY "Users can update their booking notification state"
ON chat_notification_state
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM parking_bookings pb
    WHERE pb.id = chat_notification_state.booking_id
    AND (
      pb.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM parking_listings pl
        WHERE pl.owner_id = auth.uid()
        AND pl.status IN ('approved', 'published')
        AND pb.listing_id = pl.id
      )
    )
  )
);