-- Add/Update Dubai Marina parking spaces with correct pricing from uploaded images

-- Update existing listings with correct pricing
UPDATE public.parking_listings 
SET price_per_month = 450
WHERE zone = 'Dubai Marina' AND title LIKE 'Murjan 2%';

UPDATE public.parking_listings 
SET price_per_month = 600
WHERE zone = 'Dubai Marina' AND title LIKE 'Amwaj 4%';

UPDATE public.parking_listings 
SET price_per_month = 500
WHERE zone = 'Dubai Marina' AND title LIKE 'La Riviera%';

UPDATE public.parking_listings 
SET price_per_month = 800
WHERE zone = 'Dubai Marina' AND title LIKE 'AL YASS%';

UPDATE public.parking_listings 
SET price_per_month = 500
WHERE zone = 'Dubai Marina' AND title LIKE 'Bay Central%';

UPDATE public.parking_listings 
SET price_per_month = 500
WHERE zone = 'Dubai Marina' AND (title LIKE 'Murjan -' OR title = 'Murjan');

UPDATE public.parking_listings 
SET price_per_month = 1500
WHERE zone = 'Dubai Marina' AND title LIKE 'Park Island%';

UPDATE public.parking_listings 
SET price_per_month = 500
WHERE zone = 'Dubai Marina' AND title LIKE 'Marina Diamond%';

UPDATE public.parking_listings 
SET price_per_month = 600
WHERE zone = 'Dubai Marina' AND title LIKE 'Marina Plaza%';

-- Add new parking spaces if they don't exist
INSERT INTO public.parking_listings (title, zone, address, price_per_hour, price_per_month, description, status, features, images)
SELECT * FROM (VALUES
  ('Marina Residence', 'Dubai Marina', 'Dubai Marina Walk', 35, 420, 'Secure underground parking in Marina Residence with easy access to Marina Walk and restaurants.', 'approved', ARRAY['Covered', 'Access Card', '2.1m Height'], ARRAY['/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png']),
  ('LIV Residence', 'Dubai Marina', 'Dubai Marina', 42, 500, 'Premium parking space in LIV Residence tower with 24/7 security and valet services.', 'approved', ARRAY['Covered', 'Valet', '2.2m Height'], ARRAY['/lovable-uploads/44977edf-2345-4865-9a3d-4c4a088831c9.png']),
  ('Marina Diamond 2 (2)', 'Dubai Marina', 'Dubai Marina', 42, 500, 'Additional parking space in Marina Diamond 2 building with covered parking and secure access.', 'approved', ARRAY['Covered', 'Access Card', '2.1m Height'], ARRAY['/lovable-uploads/1f58b728-bb60-444c-ba82-5ae4f6e3eea6.png'])
) AS new_listings(title, zone, address, price_per_hour, price_per_month, description, status, features, images)
WHERE NOT EXISTS (
  SELECT 1 FROM public.parking_listings 
  WHERE parking_listings.title = new_listings.title 
  AND parking_listings.zone = new_listings.zone
);