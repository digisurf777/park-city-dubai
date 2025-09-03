-- Remove any remaining Security Definer Views that might be causing the linter error
-- The parking_listings_safe_public view appears in types but should not exist as a Security Definer view

-- Ensure no Security Definer views exist - drop if any remain
DROP VIEW IF EXISTS parking_listings_safe_public CASCADE;

-- The parking_listings_public table already exists with proper RLS policies
-- and should be used instead of any Security Definer views

-- Refresh the public parking listings table to ensure it has current data
SELECT public.refresh_parking_listings_public();