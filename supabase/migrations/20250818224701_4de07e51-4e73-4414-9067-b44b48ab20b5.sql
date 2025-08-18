-- Fix Security Definer View issue
-- Drop and recreate the parking_listings_public view without SECURITY DEFINER

DROP VIEW IF EXISTS public.parking_listings_public;

-- Create the view without SECURITY DEFINER to use querying user's permissions
CREATE VIEW public.parking_listings_public AS
SELECT 
  id,
  title,
  description,
  address,
  zone,
  price_per_hour,
  price_per_day,
  price_per_month,
  features,
  images,
  availability_schedule,
  status,
  created_at,
  updated_at,
  owner_id::text as owner_id
FROM public.parking_listings
WHERE status = 'approved';

-- Grant appropriate permissions
GRANT SELECT ON public.parking_listings_public TO anon;
GRANT SELECT ON public.parking_listings_public TO authenticated;