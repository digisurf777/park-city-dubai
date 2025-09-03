-- Remove the broad RLS policy that allows confirmed booking users to view contact info
-- This policy was too permissive and is flagged by the security scanner
DROP POLICY IF EXISTS "Confirmed booking users can view contact info" ON public.parking_listings;

-- The secure approach is to use the get_booking_contact_info() function instead
-- which provides controlled access with proper logging and verification

-- Ensure users can still view basic listing info for their own listings
-- and that the public can't access the main table directly (they should use parking_listings_public)
DROP POLICY IF EXISTS "Limited public access - use public table instead" ON public.parking_listings;

-- Create a more restrictive policy - no public access to main table at all
CREATE POLICY "No public access - use public table instead" 
ON public.parking_listings 
FOR SELECT 
TO public
USING (false);

-- Contact information access is now ONLY available through:
-- 1. get_booking_contact_info() function for confirmed bookings
-- 2. Admin access for management
-- 3. Owner access to their own listings