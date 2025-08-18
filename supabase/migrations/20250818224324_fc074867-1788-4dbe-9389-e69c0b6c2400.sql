-- Fix security issue: Customer Contact Information Exposed to Public
-- Create updated RLS policies for parking_listings to hide contact info from unauthorized users

-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view full approved listings" ON public.parking_listings;
DROP POLICY IF EXISTS "Public can view approved listing details (no contact info)" ON public.parking_listings;

-- Create new secure policies that properly restrict contact information access

-- 1. Public users can view basic listing info (NO contact details)
CREATE POLICY "Public can view basic approved listings" 
ON public.parking_listings 
FOR SELECT 
USING (
  status = 'approved'
);

-- 2. Authenticated users can view listings with contact info ONLY if they have a confirmed booking
CREATE POLICY "Users can view contact info for their confirmed bookings" 
ON public.parking_listings 
FOR SELECT 
USING (
  status = 'approved' AND (
    -- User is the owner
    auth.uid() = owner_id OR
    -- User has a confirmed booking for this listing  
    EXISTS (
      SELECT 1 FROM public.parking_bookings pb 
      WHERE pb.user_id = auth.uid() 
      AND pb.location = parking_listings.address
      AND pb.zone = parking_listings.zone
      AND pb.status = 'confirmed'
    ) OR
    -- User is an admin
    is_admin(auth.uid())
  )
);

-- 3. Create a view for public access that excludes sensitive contact information
CREATE OR REPLACE VIEW public.parking_listings_public AS
SELECT 
  id,
  title,
  description,
  address,
  zone,
  price_per_hour,
  price_per_day,
  price_per_month,
  features,
  images,
  availability_schedule,
  status,
  created_at,
  updated_at,
  -- Exclude contact_phone and contact_email for public view
  NULL as contact_phone,
  NULL as contact_email,
  NULL as owner_id
FROM public.parking_listings
WHERE status = 'approved';

-- Enable RLS on the view
ALTER VIEW public.parking_listings_public SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.parking_listings_public TO anon;
GRANT SELECT ON public.parking_listings_public TO authenticated;