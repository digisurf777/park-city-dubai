-- Add new status for booking requests that need manual review
ALTER TABLE parking_bookings 
ALTER COLUMN status SET DEFAULT 'pending_review';

-- Update any existing 'active' bookings to maintain current functionality
-- (This won't affect existing data, just sets the new default for future bookings)