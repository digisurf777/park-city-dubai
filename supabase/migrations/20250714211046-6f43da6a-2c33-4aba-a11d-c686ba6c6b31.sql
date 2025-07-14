-- Fix RLS policy for parking listings to ensure anonymous users can view approved listings
DROP POLICY IF EXISTS "Everyone can view approved listings" ON public.parking_listings;

-- Create a more permissive policy for viewing approved listings
CREATE POLICY "Public can view approved listings" 
ON public.parking_listings 
FOR SELECT 
USING (status = 'approved');

-- Ensure the parking_listings table has RLS enabled
ALTER TABLE public.parking_listings ENABLE ROW LEVEL SECURITY;