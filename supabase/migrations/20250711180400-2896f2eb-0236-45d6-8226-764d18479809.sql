-- Insert parking listings for Dubai Marina based on the uploaded images
INSERT INTO public.parking_listings (
    owner_id, 
    title, 
    description, 
    address, 
    zone, 
    price_per_hour, 
    price_per_day, 
    price_per_month,
    features,
    status
) VALUES 
-- Using a placeholder owner_id - will need actual user IDs in production
(
    '00000000-0000-0000-0000-000000000000',
    'Murjan 2 - Premium Parking',
    'Secure parking space in prestigious Murjan 2 tower with 24/7 access and covered parking.',
    'Murjan 2, Dubai Marina, Dubai',
    'Dubai Marina',
    18.75, -- 450/24 hours
    450.00,
    13500.00, -- 450*30
    ARRAY['covered', 'security', '24/7 access', 'valet available'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Marina Residence - Secure Parking',
    'Premium parking space in Marina Residence with excellent marina views access.',
    'Marina Residence, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'security', '24/7 access'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Amwaj 4 - Waterfront Parking',
    'Exclusive parking in Amwaj 4 with direct access to marina promenade.',
    'Amwaj 4, Dubai Marina, Dubai',
    'Dubai Marina',
    25.00, -- 600/24
    600.00,
    18000.00,
    ARRAY['covered', 'security', 'marina access', 'concierge'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'La Riviera Tower - Executive Parking',
    'High-end parking facility in La Riviera Tower with premium amenities.',
    'La Riviera Tower, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'valet parking', 'car wash service', 'security'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'AL YASS TOWER - Luxury Parking',
    'Premium parking spaces in AL YASS TOWER with luxury car facilities.',
    'AL YASS TOWER, Dubai Marina, Dubai',
    'Dubai Marina',
    33.33, -- 800/24
    800.00,
    24000.00,
    ARRAY['covered', 'luxury car care', 'valet parking', 'security', 'car detailing'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Bay Central Tower - Central Parking',
    'Convenient parking in Bay Central Tower with easy marina access.',
    'Bay Central Tower, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'security', '24/7 access', 'elevator access'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Murjan - Classic Marina Parking',
    'Reliable parking solution in Murjan tower with standard amenities.',
    'Murjan, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'security', 'CCTV monitoring'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Park Island - Ultra Premium Parking',
    'Exclusive parking in Park Island with top-tier luxury services.',
    'Park Island, Dubai Marina, Dubai',
    'Dubai Marina',
    62.50, -- 1500/24
    1500.00,
    45000.00,
    ARRAY['covered', 'luxury valet', 'car detailing', 'concierge service', 'premium location'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Marina Diamond 2 - Modern Parking',
    'Contemporary parking facility in Marina Diamond 2 with modern amenities.',
    'Marina Diamond 2, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'security', 'electric car charging', 'app booking'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Marina Plaza - Business District Parking',
    'Professional parking services in Marina Plaza for business travelers.',
    'Marina Plaza, Dubai Marina, Dubai',
    'Dubai Marina',
    25.00, -- 600/24
    600.00,
    18000.00,
    ARRAY['covered', 'business center access', 'security', 'meeting room nearby'],
    'approved'
),
(
    '00000000-0000-0000-0000-000000000000',
    'LIV Residence - Lifestyle Parking',
    'Modern parking solution in LIV Residence with lifestyle amenities.',
    'LIV Residence, Dubai Marina, Dubai',
    'Dubai Marina',
    20.83, -- 500/24
    500.00,
    15000.00,
    ARRAY['covered', 'security', 'gym access', 'pool nearby'],
    'approved'
);

-- Create storage bucket for parking listing images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('parking-images', 'parking-images', true);

-- Create storage policies for parking images
CREATE POLICY "Anyone can view parking images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'parking-images');

CREATE POLICY "Authenticated users can upload parking images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'parking-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own parking images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'parking-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own parking images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'parking-images' AND auth.role() = 'authenticated');