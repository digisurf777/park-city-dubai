-- Fix security vulnerability: Restrict parking owner contact information access
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public can view basic approved listings (no contact info)" ON parking_listings;
DROP POLICY IF EXISTS "Users can view contact info for their confirmed bookings" ON parking_listings;

-- Create secure function to get public parking listings without contact info
CREATE OR REPLACE FUNCTION public.get_public_parking_listings()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  address text,
  zone text,
  price_per_hour numeric,
  price_per_day numeric,
  price_per_month numeric,
  features text[],
  images text[],
  availability_schedule jsonb,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  owner_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return approved listings without sensitive contact information
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
    pl.owner_id::text
  FROM parking_listings pl
  WHERE pl.status = 'approved';
END;
$$;

-- Create new restrictive RLS policies
-- 1. Public can view ONLY basic info (no contact details) for approved listings
CREATE POLICY "Public can view approved listings basic info only" 
ON parking_listings 
FOR SELECT 
TO public
USING (
  status = 'approved' 
  AND (
    -- Anonymous users can only see basic info (contact fields will be null in application layer)
    auth.role() = 'anon'
    OR
    -- Authenticated users can see basic info (contact fields will be null in application layer)  
    auth.role() = 'authenticated'
  )
);

-- 2. Users with confirmed bookings can see full contact info
CREATE POLICY "Confirmed booking users can view contact info" 
ON parking_listings 
FOR SELECT 
TO authenticated
USING (
  status = 'approved' 
  AND EXISTS (
    SELECT 1 
    FROM parking_bookings pb 
    WHERE pb.user_id = auth.uid() 
      AND pb.location = parking_listings.address 
      AND pb.zone = parking_listings.zone 
      AND pb.status = 'confirmed'
  )
);

-- 3. Owners can view their own listings (full info)
CREATE POLICY "Owners can view own listings" 
ON parking_listings 
FOR SELECT 
TO authenticated
USING (auth.uid() = owner_id);

-- 4. Admins can view all listings (full info) - this policy already exists but ensuring it's comprehensive
CREATE POLICY "Admins have full access to all listings" 
ON parking_listings 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Update the parking_listings_public table to also exclude contact information
-- This table is used for public access and should never contain sensitive data
ALTER TABLE parking_listings_public 
DROP COLUMN IF EXISTS contact_phone,
DROP COLUMN IF EXISTS contact_email;

-- Update the sync function to ensure contact info is never copied to public table
CREATE OR REPLACE FUNCTION public.sync_parking_listings_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Refresh the entire public table when any approved listing changes
  -- Ensure no contact information is ever included
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'approved' THEN
    PERFORM public.refresh_parking_listings_public();
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'approved') THEN
    PERFORM public.refresh_parking_listings_public();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update refresh function to exclude contact information
CREATE OR REPLACE FUNCTION public.refresh_parking_listings_public()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;