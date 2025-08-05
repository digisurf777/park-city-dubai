-- Make all parking spaces unavailable by updating their status to 'inactive'
UPDATE public.parking_listings 
SET status = 'inactive', 
    updated_at = now()
WHERE status = 'approved';