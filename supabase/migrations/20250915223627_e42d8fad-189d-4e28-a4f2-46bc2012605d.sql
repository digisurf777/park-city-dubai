-- Add 'published' status to parking_listings check constraint
ALTER TABLE public.parking_listings 
DROP CONSTRAINT IF EXISTS parking_listings_status_check;

ALTER TABLE public.parking_listings 
ADD CONSTRAINT parking_listings_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'published'));

-- Update existing approved listings to remain approved (not auto-published)
-- This preserves current state and requires manual publishing

-- Update the public listings refresh function to only show published listings
CREATE OR REPLACE FUNCTION public.refresh_parking_listings_public()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  listing_record RECORD;
BEGIN
  -- Clear existing data
  DELETE FROM public.parking_listings_public WHERE id IS NOT NULL;
  
  -- Insert ONLY non-sensitive data from PUBLISHED listings (not just approved)
  FOR listing_record IN (
    SELECT 
      id, title, description, address, zone, price_per_hour,
      price_per_day, price_per_month, features, images,
      availability_schedule, status, created_at, updated_at
    FROM public.parking_listings
    WHERE status = 'published'  -- Changed from 'approved' to 'published'
    AND title IS NOT NULL 
    AND address IS NOT NULL
    AND zone IS NOT NULL
  ) LOOP
    INSERT INTO public.parking_listings_public (
      id, title, description, address, zone, price_per_hour,
      price_per_day, price_per_month, features, images,
      availability_schedule, status, created_at, updated_at
    ) VALUES (
      listing_record.id, 
      listing_record.title, 
      listing_record.description, 
      listing_record.address, 
      listing_record.zone, 
      listing_record.price_per_hour,
      listing_record.price_per_day, 
      listing_record.price_per_month, 
      listing_record.features, 
      listing_record.images,
      listing_record.availability_schedule, 
      listing_record.status, 
      listing_record.created_at, 
      listing_record.updated_at
    );
  END LOOP;
  
  -- Log the refresh for audit purposes
  RAISE LOG 'Public parking listings refreshed. Records copied: %', 
    (SELECT COUNT(*) FROM public.parking_listings WHERE status = 'published');
END;
$$;

-- Update the parking listings with availability function to only show published listings
CREATE OR REPLACE FUNCTION public.get_parking_listings_with_availability()
RETURNS TABLE(id uuid, title text, description text, address text, zone text, price_per_hour numeric, price_per_day numeric, price_per_month numeric, features text[], images text[], availability_schedule jsonb, status text, created_at timestamp with time zone, updated_at timestamp with time zone, total_spaces bigint, available_spaces bigint, booked_spaces bigint, maintenance_spaces bigint, is_available boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pl.id,
    pl.title,
    pl.description,
    pl.address,
    pl.zone,
    pl.price_per_hour,
    pl.price_per_day,
    pl.price_per_month,
    pl.features,
    pl.images,
    pl.availability_schedule,
    pl.status,
    pl.created_at,
    pl.updated_at,
    COALESCE(space_stats.total_spaces, 0) as total_spaces,
    COALESCE(space_stats.available_spaces, 0) as available_spaces,
    COALESCE(space_stats.booked_spaces, 0) as booked_spaces,
    COALESCE(space_stats.maintenance_spaces, 0) as maintenance_spaces,
    CASE 
      WHEN space_stats.available_spaces > 0 THEN true
      WHEN space_stats.total_spaces = 0 THEN true -- If no spaces created yet, show as available
      ELSE false
    END as is_available
  FROM public.parking_listings pl
  LEFT JOIN (
    SELECT 
      ps.listing_id,
      COUNT(*) as total_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'available') as available_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'booked') as booked_spaces,
      COUNT(*) FILTER (WHERE ps.space_status = 'maintenance') as maintenance_spaces
    FROM public.parking_spaces ps
    GROUP BY ps.listing_id
  ) space_stats ON pl.id = space_stats.listing_id
  WHERE pl.status = 'published'  -- Changed from 'approved' to 'published'
  ORDER BY pl.created_at DESC;
END;
$$;

-- Update the safe public listings function
CREATE OR REPLACE FUNCTION public.get_safe_public_listings()
RETURNS TABLE(id uuid, title text, description text, address text, zone text, price_per_hour numeric, price_per_day numeric, price_per_month numeric, features text[], images text[], availability_schedule jsonb, status text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return published listings WITHOUT any sensitive fields
  RETURN QUERY 
  SELECT 
    pl.id,
    pl.title,
    pl.description,
    pl.address,
    pl.zone,
    pl.price_per_hour,
    pl.price_per_day,
    pl.price_per_month,
    pl.features,
    pl.images,
    pl.availability_schedule,
    pl.status,
    pl.created_at,
    pl.updated_at
  FROM parking_listings pl
  WHERE pl.status = 'published';  -- Changed from 'approved' to 'published'
END;
$$;

-- Update RLS policies for parking_listings_public table
DROP POLICY IF EXISTS "Allow limited public access to approved parking listings" ON public.parking_listings_public;
DROP POLICY IF EXISTS "Public table full access for approved listings" ON public.parking_listings_public;

CREATE POLICY "Public table full access for published listings" 
ON public.parking_listings_public 
FOR SELECT 
USING (status = 'published');

-- Update the sync trigger to work with published status
CREATE OR REPLACE FUNCTION public.sync_parking_listings_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Refresh the entire public table when any published listing changes
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'published' THEN
    PERFORM public.refresh_parking_listings_public();
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'published') THEN
    PERFORM public.refresh_parking_listings_public();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;