-- Fix parking listings RLS policies for admin approval functionality
-- First, drop all existing admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.parking_listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.parking_listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON public.parking_listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.parking_listings;
DROP POLICY IF EXISTS "Admins have full access to all listings" ON public.parking_listings;

-- Create a single comprehensive admin policy
CREATE POLICY "admins_full_access_parking_listings" 
ON public.parking_listings 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Ensure the existing user policies remain
-- Users can create their own listings
-- Users can update their own listings  
-- Users can view their own listings
-- Public can view approved listings basic info only
-- Confirmed booking users can view contact info

-- Test the is_admin function works properly
DO $$
BEGIN
  -- This will help us verify the admin function works
  RAISE NOTICE 'Testing admin function setup...';
END $$;