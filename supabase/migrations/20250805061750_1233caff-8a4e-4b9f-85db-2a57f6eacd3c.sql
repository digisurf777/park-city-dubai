-- Make all parking spaces unavailable by updating their status
UPDATE public.parking_listings 
SET status = 'unavailable', 
    updated_at = now()
WHERE status = 'approved';

-- Add 'unavailable' as a valid status option if it doesn't exist
-- This ensures the status change is valid