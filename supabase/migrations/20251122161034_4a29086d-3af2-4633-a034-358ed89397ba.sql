-- Step 1: Add listing_id column to parking_bookings
ALTER TABLE parking_bookings
ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES parking_listings(id);

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_parking_bookings_listing_id ON parking_bookings(listing_id);

-- Step 3: Create parking space for the new Al Murjan Tower listing directly
INSERT INTO parking_spaces (listing_id, space_number, space_status, override_status)
VALUES ('435a846e-b0c3-4284-b5ef-2d628753ef90', 'Main Space', 'available', true)
ON CONFLICT (listing_id, space_number) DO NOTHING;

-- Step 4: Drop old get_booked_date_ranges function
DROP FUNCTION IF EXISTS get_booked_date_ranges(TEXT, TEXT, TEXT);

-- Step 5: Create new get_booked_date_ranges function with listing_id support
CREATE OR REPLACE FUNCTION get_booked_date_ranges(
  p_listing_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_zone TEXT DEFAULT NULL
)
RETURNS TABLE (
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If listing_id is provided, use exact matching (preferred method)
  IF p_listing_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      pb.start_time as start_date,
      pb.end_time as end_date
    FROM parking_bookings pb
    WHERE pb.listing_id = p_listing_id
      AND pb.status IN ('confirmed', 'approved', 'pending')
    ORDER BY pb.start_time;
    RETURN;
  END IF;

  -- Fallback to old logic for backward compatibility (exact match only, not fuzzy)
  RETURN QUERY
  SELECT 
    pb.start_time as start_date,
    pb.end_time as end_date
  FROM parking_bookings pb
  WHERE pb.location = p_address
    AND pb.zone = p_zone
    AND pb.status IN ('confirmed', 'approved', 'pending')
  ORDER BY pb.start_time;
END;
$$;

COMMENT ON FUNCTION get_booked_date_ranges IS 'Returns booked date ranges for a listing. Prefers listing_id for exact matching, falls back to address+zone for legacy support.';