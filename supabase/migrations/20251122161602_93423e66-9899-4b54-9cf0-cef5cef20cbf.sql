-- Fix Al Murjan Tower booking availability issue
-- This migration links the existing 6-month booking to the correct old listing
-- and creates a parking space to properly track availability

-- Step 1: Create parking space for old Al Murjan listing
INSERT INTO parking_spaces (
  listing_id,
  space_number,
  space_status,
  override_status
)
VALUES (
  'ba409edf-e951-404a-8ce5-20c065e9a739',  -- Old "Covered parking in Al Murjan Tower" listing
  '1',
  'booked',  -- Mark as booked immediately since there's an active booking
  false
)
ON CONFLICT (listing_id, space_number) DO NOTHING;

-- Step 2: Link existing booking to the old listing
UPDATE parking_bookings
SET listing_id = 'ba409edf-e951-404a-8ce5-20c065e9a739'
WHERE id = 'fb16b2f4-2628-4516-8459-173b864fab41'
  AND listing_id IS NULL;  -- Only update if not already linked

-- Verify the fix worked
DO $$
DECLARE
  space_count INTEGER;
  booking_linked BOOLEAN;
BEGIN
  -- Check if space was created
  SELECT COUNT(*) INTO space_count
  FROM parking_spaces
  WHERE listing_id = 'ba409edf-e951-404a-8ce5-20c065e9a739';
  
  -- Check if booking was linked
  SELECT (listing_id IS NOT NULL) INTO booking_linked
  FROM parking_bookings
  WHERE id = 'fb16b2f4-2628-4516-8459-173b864fab41';
  
  -- Log results
  RAISE NOTICE 'Al Murjan fix verification:';
  RAISE NOTICE '  Parking spaces created: %', space_count;
  RAISE NOTICE '  Booking linked: %', booking_linked;
  
  IF space_count = 0 OR NOT booking_linked THEN
    RAISE WARNING 'Al Murjan fix may not have completed successfully';
  END IF;
END $$;