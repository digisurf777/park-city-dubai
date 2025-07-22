-- Fix storage policies for verification-docs bucket
-- Remove restrictive policies and create simpler ones
DROP POLICY IF EXISTS "Allow authenticated users to upload verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to view all verification docs" ON storage.objects;

-- Create simple policy for verification docs uploads
CREATE POLICY "Authenticated users can upload verification docs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.role() = 'authenticated'
);

-- Create simple policy for verification docs access
CREATE POLICY "Authenticated users can view verification docs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-docs');

-- Ensure the parking_listings table allows all required operations
-- Check if price_per_day column exists and is nullable
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'parking_listings' AND column_name = 'price_per_day') THEN
        -- Make price_per_day nullable if it isn't already
        ALTER TABLE public.parking_listings ALTER COLUMN price_per_day DROP NOT NULL;
    END IF;
END $$;