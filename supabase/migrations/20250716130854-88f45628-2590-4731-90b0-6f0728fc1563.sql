-- Insert parking spaces for Downtown Dubai
INSERT INTO public.parking_listings (
  title, 
  description, 
  address, 
  zone, 
  price_per_hour, 
  price_per_month, 
  features, 
  images, 
  status
) VALUES (
  'The Lofts Central Tower',
  'Prime downtown parking in The Lofts Central Tower. Secure underground parking with 24/7 access and CCTV surveillance.',
  'The Lofts Central Tower, Downtown Dubai',
  'Downtown',
  15.00,
  250.00,
  ARRAY['Access Card', 'Covered', '2.5m Height', 'CCTV', '24/7 Security'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
);

-- Insert parking spaces for Palm Jumeirah
INSERT INTO public.parking_listings (
  title, 
  description, 
  address, 
  zone, 
  price_per_hour, 
  price_per_month, 
  features, 
  images, 
  status
) VALUES 
(
  'East Golf Tower',
  'Secure parking space in East Golf Tower with 24/7 access and premium amenities in the heart of Palm Jumeirah.',
  'East Golf Tower, Palm Jumeirah',
  'Palm Jumeirah',
  25.00,
  500.00,
  ARRAY['Covered', '24/7 Security', 'Premium', 'Valet Service'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
),
(
  'Shoreline Apartments',
  'Secure underground parking in the heart of Palm Jumeirah with 24/7 security and CCTV surveillance.',
  'Shoreline Apartments, Palm Jumeirah',
  'Palm Jumeirah',
  45.00,
  900.00,
  ARRAY['Underground', '24/7 Security', 'CCTV', 'Climate Controlled'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
),
(
  'The Palm Tower',
  'Underground parking garage in The Palm Tower, in the heart of Palm Jumeirah with 24/7 security.',
  'The Palm Tower, Palm Jumeirah',
  'Palm Jumeirah',
  40.00,
  800.00,
  ARRAY['Underground', '24/7 Security', 'Premium', 'Elevator Access'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
);

-- Insert parking spaces for Deira
INSERT INTO public.parking_listings (
  title, 
  description, 
  address, 
  zone, 
  price_per_hour, 
  price_per_month, 
  features, 
  images, 
  status
) VALUES 
(
  'Al Meraikhi Tower 2',
  'Convenient covered parking space in Al Meraikhi Tower 2 with easy elevator access and CCTV surveillance.',
  'Al Meraikhi Tower 2, Deira',
  'Deira',
  15.00,
  300.00,
  ARRAY['Covered', 'Elevator Access', 'CCTV', '24/7 Access'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
),
(
  'Abraj Al Mamzar',
  'Secure underground parking close to Al Mulla Plaza with convenient access and safety features.',
  'Abraj Al Mamzar, Deira',
  'Deira',
  10.00,
  200.00,
  ARRAY['Underground', 'Secure', 'Al Mulla Plaza', 'CCTV'],
  ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png'],
  'approved'
);