-- Add missing parking listings for other zones to connect them to the database

-- Business Bay listings
INSERT INTO parking_listings (title, description, address, zone, price_per_hour, price_per_month, status, images, features) VALUES
('Zada Tower', 'Ultra-premium parking space in the luxury Zada Tower with top-tier amenities and 24/7 security.', 'Zada Tower, Business Bay', 'Business Bay', 166.67, 4000, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Premium', 'Ultra Luxury', '24/7 Security']),
('Millenium Binghatti Residence', 'Modern residential parking in Millenium Binghatti with secure access and contemporary amenities.', 'Millenium Binghatti Residence, Business Bay', 'Business Bay', 41.67, 1000, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Residential', 'Modern', 'Secure']),
('Reva Residence DAMAC', 'Quality DAMAC parking with covered spaces and 24/7 access in the heart of Business Bay.', 'Reva Residence DAMAC, Business Bay', 'Business Bay', 25.00, 600, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['DAMAC Quality', 'Covered', '24/7']),
('Bellevue Towers', 'Space 24 - Secured covered parking space available for rent with accessible 24/7 access.', 'Bellevue Towers, Business Bay', 'Business Bay', 39.58, 950, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Space 24', 'Secured', 'Covered']),
('SOL Avenue', 'Secure and covered parking with 24-hour security and concierge services providing added protection.', 'SOL Avenue, Business Bay', 'Business Bay', 37.50, 900, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Secure', 'Covered', 'Concierge']),
('Tower A DAMAC Towers by Paramount', 'Secure and covered parking space in DAMAC Towers with 24/7 access for ultimate convenience.', 'Tower A, DAMAC Towers by Paramount, Business Bay', 'Business Bay', 41.67, 1000, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['DAMAC Premium', '24/7 Access', 'Covered']);

-- DIFC listings
INSERT INTO parking_listings (title, description, address, zone, price_per_hour, price_per_month, status, images, features) VALUES
('Limestone House 5F2', 'Space number 2176 - Secured covered parking space available for rent with professional access.', 'Limestone House, DIFC', 'DIFC', 22.92, 550, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Space 2176', 'Secured', 'Covered']);

-- Downtown listings
INSERT INTO parking_listings (title, description, address, zone, price_per_hour, price_per_month, status, images, features) VALUES
('Burj Vista', 'Basement-level parking space in the heart of Downtown. CCTV surveillance, 24-hour maintenance, and concierge services available.', 'Burj Vista, Downtown Dubai', 'Downtown', 35.83, 860, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['CCTV', '24h Security', 'Concierge']);

-- Add more zone-specific listings as needed
-- Deira listings
INSERT INTO parking_listings (title, description, address, zone, price_per_hour, price_per_month, status, images, features) VALUES
('Deira City Centre', 'Convenient parking in the heart of Deira with easy access to shopping and business districts.', 'Deira City Centre, Deira', 'Deira', 20.83, 500, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Central', 'Shopping Access', 'Covered']);

-- Palm Jumeirah listings
INSERT INTO parking_listings (title, description, address, zone, price_per_hour, price_per_month, status, images, features) VALUES
('Atlantis The Palm', 'Luxury parking space with direct access to Atlantis resort and Palm Jumeirah attractions.', 'Atlantis The Palm, Palm Jumeirah', 'Palm Jumeirah', 83.33, 2000, 'approved', ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'], ARRAY['Luxury', 'Resort Access', 'Premium Location']);