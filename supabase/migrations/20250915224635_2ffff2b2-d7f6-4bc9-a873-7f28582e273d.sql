-- Update approved listings to published status so they show on the website
-- This will make existing car parks visible to users

UPDATE public.parking_listings 
SET status = 'published', updated_at = NOW()
WHERE status = 'approved' 
  AND zone IN ('Dubai Marina', 'Downtown', 'DIFC', 'Business Bay', 'Palm Jumeirah', 'Deira');

-- Refresh the public listings table to sync changes
SELECT public.refresh_parking_listings_public();