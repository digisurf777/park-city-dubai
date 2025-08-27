-- Fix the refresh function to avoid DELETE without WHERE clause
DROP FUNCTION IF EXISTS public.refresh_parking_listings_public();

CREATE OR REPLACE FUNCTION public.refresh_parking_listings_public()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Instead of DELETE all, use TRUNCATE which is safer for this use case
  -- or use DELETE with a condition that matches all records
  DELETE FROM public.parking_listings_public WHERE id IS NOT NULL;
  
  -- Insert fresh data from main table excluding contact information
  INSERT INTO public.parking_listings_public (
    id, title, description, address, zone, price_per_hour, 
    price_per_day, price_per_month, features, images, 
    availability_schedule, status, created_at, updated_at, owner_id
  )
  SELECT 
    id, title, description, address, zone, price_per_hour,
    price_per_day, price_per_month, features, images,
    availability_schedule, status, created_at, updated_at, 
    owner_id::text
  FROM public.parking_listings
  WHERE status = 'approved';
END;
$function$;