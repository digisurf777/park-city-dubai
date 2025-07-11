-- Update parking listings with proper images for Dubai Marina
UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Murjan 2%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Marina Residence%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Amwaj 4%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/25cbaba8-3854-4bb0-9a3f-f044623c6db8.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'La Riviera%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/645ad921-4efc-4172-858a-ce781e236f08.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'AL YASS%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/747c1f5d-d6b2-4f6a-94a2-aca1927ee856.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Bay Central%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/ba4a4def-2cd7-4e97-89d5-074c13f0bbe8.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Murjan -' OR title = 'Murjan';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/bff8556c-9c7b-4765-820d-b007ca48c5ac.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Park Island%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Marina Diamond%';

UPDATE public.parking_listings 
SET images = ARRAY['/lovable-uploads/b290c213-897d-4efd-9d2c-6fc62c2f853e.png']
WHERE zone = 'Dubai Marina' AND title LIKE 'Marina Plaza%';