-- Fix RLS policy for parking_listings table to allow users to insert their own listings
-- First, drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Owners can create their own listings" ON public.parking_listings;

-- Create a new policy that allows authenticated users to insert listings with their own user_id
CREATE POLICY "Users can create their own listings" 
ON public.parking_listings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Also ensure users can view their own listings
DROP POLICY IF EXISTS "Owners can view their own listings" ON public.parking_listings;

CREATE POLICY "Users can view their own listings" 
ON public.parking_listings 
FOR SELECT 
TO authenticated
USING (auth.uid() = owner_id);

-- Allow users to update their own listings
DROP POLICY IF EXISTS "Owners can update their own listings" ON public.parking_listings;

CREATE POLICY "Users can update their own listings" 
ON public.parking_listings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id);