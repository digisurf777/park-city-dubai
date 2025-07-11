-- Add user type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_type text DEFAULT 'renter' CHECK (user_type IN ('renter', 'owner'));

-- Create parking listings table
CREATE TABLE public.parking_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    zone TEXT NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_per_day DECIMAL(10,2),
    price_per_month DECIMAL(10,2),
    availability_schedule JSONB, -- Store availability schedule
    features TEXT[], -- Array of features like "covered", "24/7 access", etc.
    images TEXT[], -- Array of image URLs
    contact_phone TEXT,
    contact_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on parking_listings
ALTER TABLE public.parking_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for parking_listings
CREATE POLICY "Owners can view their own listings"
ON public.parking_listings
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their own listings"
ON public.parking_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own listings"
ON public.parking_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all listings"
ON public.parking_listings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all listings"
ON public.parking_listings
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Everyone can view approved listings"
ON public.parking_listings
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Add trigger for updated_at
CREATE TRIGGER update_parking_listings_updated_at
BEFORE UPDATE ON public.parking_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();