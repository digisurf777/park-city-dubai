
-- Link the confirmed Al Majara 3 booking to its listing
UPDATE parking_bookings
SET listing_id = '7e7e2104-b2f2-4710-b749-8cfc749b03e8'
WHERE id = '8d973ec7-c18d-47e7-a04b-209ee152a3e0'
AND listing_id IS NULL;
