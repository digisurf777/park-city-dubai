-- Link Edward Sollis's booking to the Index tower listing
UPDATE parking_bookings
SET listing_id = '1e38caa2-a52a-4c98-a5ea-03510b349531',
    updated_at = NOW()
WHERE id = 'fad839f7-86e2-44c3-a30f-efc03c5363a5'
  AND listing_id IS NULL;

-- Also audit and fix any other active bookings with missing listing_id
-- First, let's find all confirmed/approved bookings without listing_id and try to match by location
WITH unlinked_bookings AS (
  SELECT 
    pb.id as booking_id,
    pb.location,
    pb.zone,
    pl.id as listing_id
  FROM parking_bookings pb
  LEFT JOIN parking_listings pl ON (
    -- Match by location/address containing similar text
    LOWER(pb.location) LIKE '%' || LOWER(SPLIT_PART(pl.title, ' ', 1)) || '%'
    OR LOWER(pb.location) LIKE '%' || LOWER(SPLIT_PART(pl.address, ',', 1)) || '%'
    OR LOWER(pl.title) LIKE '%' || LOWER(SPLIT_PART(pb.location, ' ', 1)) || '%'
  )
  WHERE pb.listing_id IS NULL
    AND pb.status IN ('confirmed', 'approved')
    AND pb.end_time > NOW()
    AND pl.id IS NOT NULL
)
UPDATE parking_bookings pb
SET listing_id = ub.listing_id,
    updated_at = NOW()
FROM unlinked_bookings ub
WHERE pb.id = ub.booking_id
  AND pb.listing_id IS NULL;