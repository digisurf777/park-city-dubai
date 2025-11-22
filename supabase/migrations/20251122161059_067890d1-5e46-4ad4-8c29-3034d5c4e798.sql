-- Fix security warning: Set search_path for get_booked_date_ranges function
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
SET search_path = public
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