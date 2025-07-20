-- Check and create storage policies for parking-images bucket
-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('parking-images', 'parking-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view parking images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own parking images" ON storage.objects;

-- Create comprehensive storage policies for parking-images
CREATE POLICY "Anyone can view parking images"
ON storage.objects FOR SELECT
USING (bucket_id = 'parking-images');

CREATE POLICY "Authenticated users can upload parking images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'parking-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own parking images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'parking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own parking images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'parking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);