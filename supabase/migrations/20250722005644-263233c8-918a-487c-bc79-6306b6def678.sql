-- Fix storage policies for file uploads
-- Create policies for parking-images bucket
CREATE POLICY "Allow authenticated users to upload parking images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'parking-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to parking images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'parking-images');

-- Create policies for verification-docs bucket  
CREATE POLICY "Allow authenticated users to upload verification docs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view their own verification docs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all verification docs
CREATE POLICY "Allow admins to view all verification docs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);