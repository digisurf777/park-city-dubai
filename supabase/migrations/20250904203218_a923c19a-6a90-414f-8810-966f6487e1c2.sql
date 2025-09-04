-- Fix the security definer view issue by removing the problematic view
-- This addresses the security linter error about SECURITY DEFINER views

DROP VIEW IF EXISTS public.safe_parking_listings;

-- The parking_listings_public table itself is already secure and doesn't need 
-- an additional view layer that could introduce security risks