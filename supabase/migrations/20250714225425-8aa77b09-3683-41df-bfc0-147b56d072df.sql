-- Insert DIFC parking listings
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
  'Sky Gardens DIFC',
  'Premium parking space in Sky Gardens DIFC with 24/7 security and modern amenities.',
  'Sky Gardens DIFC, DIFC',
  'DIFC',
  22.92,
  550,
  ARRAY['Sky Gardens', 'Premium', '24/7 Security'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-sky-gardens.jpg'],
  'approved'
),
(
  'Index Tower',
  'Basement parking in the highly sought-after Index Tower with 24-hour security, concierge, and easy elevator access.',
  'Index Tower, DIFC',
  'DIFC',
  31.25,
  750,
  ARRAY['Premium Tower', 'Basement', 'Concierge'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-index-tower.jpg'],
  'approved'
),
(
  'Burj Daman',
  'Premium secure parking in the landmark Burj Daman tower with excellent DIFC access.',
  'Burj Daman, DIFC',
  'DIFC',
  29.17,
  700,
  ARRAY['Landmark', 'Secure', 'Premium'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-burj-daman.jpg'],
  'approved'
),
(
  'Aspin Commercial Tower (3A-31)',
  'Space 3A-31 in Aspin Commercial Tower with secure access and professional amenities.',
  'Aspin Commercial Tower, DIFC',
  'DIFC',
  25.00,
  600,
  ARRAY['Commercial', 'Space 3A-31', 'Secure'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-aspin-tower.jpg'],
  'approved'
),
(
  'Aspin Commercial Tower (5A-25)',
  'Space 5A-25 in Aspin Commercial Tower with secure parking and business district access.',
  'Aspin Commercial Tower, DIFC',
  'DIFC',
  25.00,
  600,
  ARRAY['Commercial', 'Space 5A-25', 'Secure'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-aspin-tower-2.jpg'],
  'approved'
),
(
  'DAMAC Park Towers',
  'Space P2 088 - Secure parking in DAMAC Park Towers with quality amenities and professional access.',
  'DAMAC Park Towers, DIFC',
  'DIFC',
  27.08,
  650,
  ARRAY['DAMAC Quality', 'Space P2 088', 'Secure'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-damac-park.jpg'],
  'approved'
),
(
  'Sky Gardens DIFC (Ground Floor)',
  'Ground floor parking close to the exit in Sky Gardens DIFC with premium access and convenience.',
  'Sky Gardens DIFC, DIFC',
  'DIFC',
  27.08,
  650,
  ARRAY['Ground Floor', 'Exit Access', 'Premium'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-sky-gardens-ground.jpg'],
  'approved'
),
(
  'Limestone House 5F2',
  'Space number 2176 - Secured covered parking space available for rent with professional access.',
  'Limestone House, DIFC',
  'DIFC',
  22.92,
  550,
  ARRAY['Space 2176', 'Secured', 'Covered'],
  ARRAY['https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/parking-images/parking-listings/difc-limestone-house.jpg'],
  'approved'
);