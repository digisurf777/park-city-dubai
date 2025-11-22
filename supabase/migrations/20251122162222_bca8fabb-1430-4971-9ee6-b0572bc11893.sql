-- Update Al Murjan Tower parking space to show as available
-- The booking dates will still be blocked in the calendar via get_booked_date_ranges()
UPDATE parking_spaces
SET 
  space_status = 'available',
  updated_at = NOW()
WHERE id = '5f91788a-b97c-43ef-8f8e-b8c0272ead9a'
  AND space_status = 'booked';

-- Verify the update
DO $$
DECLARE
  space_status_result TEXT;
  listing_title TEXT;
BEGIN
  SELECT ps.space_status, pl.title 
  INTO space_status_result, listing_title
  FROM parking_spaces ps
  JOIN parking_listings pl ON ps.listing_id = pl.id
  WHERE ps.id = '5f91788a-b97c-43ef-8f8e-b8c0272ead9a';
  
  RAISE NOTICE 'Al Murjan Tower space status updated:';
  RAISE NOTICE '  Listing: %', listing_title;
  RAISE NOTICE '  New status: %', space_status_result;
  RAISE NOTICE '  Note: Booking dates (Nov 21 - May 21) will still appear as unavailable in calendar';
END $$;