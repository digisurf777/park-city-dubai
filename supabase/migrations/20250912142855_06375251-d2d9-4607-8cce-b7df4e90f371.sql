-- Fix RLS policies to allow admins to view parking listings
-- First, drop the restrictive policy
DROP POLICY IF EXISTS "No public access - use public table instead" ON public.parking_listings;

-- Ensure admin can view all listings  
CREATE POLICY "Admins can view all listings" 
ON public.parking_listings 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Ensure owners can view their own listings
CREATE POLICY "Owners can view own listings" 
ON public.parking_listings 
FOR SELECT 
USING (auth.uid() = owner_id);