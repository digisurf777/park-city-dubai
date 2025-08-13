-- Update all inactive parking listings to approved status
UPDATE public.parking_listings 
SET status = 'approved', updated_at = NOW()
WHERE status = 'inactive';