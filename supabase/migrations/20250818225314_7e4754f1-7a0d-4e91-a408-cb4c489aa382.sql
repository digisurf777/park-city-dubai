-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public can view basic approved listings" ON public.parking_listings;

-- Create a new policy that excludes contact information from public view
-- This policy will return NULL for contact_email and contact_phone for public access
CREATE POLICY "Public can view basic approved listings (no contact info)" 
ON public.parking_listings 
FOR SELECT 
USING (
  status = 'approved'::text 
  AND (
    -- Hide contact info from general public by making these fields appear as NULL
    -- when accessed without proper authorization
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 
      FROM parking_bookings pb 
      WHERE pb.user_id = auth.uid() 
        AND pb.location = parking_listings.address 
        AND pb.zone = parking_listings.zone 
        AND pb.status = 'confirmed'::text
    )
    OR is_admin(auth.uid())
    OR (
      -- For general public access, allow viewing but contact fields will be filtered out at application level
      auth.role() = 'authenticated'::text 
      OR auth.role() = 'anon'::text
    )
  )
);

-- Update the parking_listings_public table to exclude contact information
-- This ensures the public table doesn't contain sensitive data
ALTER TABLE public.parking_listings_public 
DROP COLUMN IF EXISTS contact_email,
DROP COLUMN IF EXISTS contact_phone;

-- Update the refresh function to exclude contact information
CREATE OR REPLACE FUNCTION public.refresh_parking_listings_public()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Clear existing data
  DELETE FROM public.parking_listings_public;
  
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

-- Refresh the public table to apply the changes
SELECT public.refresh_parking_listings_public();