-- Fix UUID casting issues in storage policies that cause authentication failures
-- The issue is comparing auth.uid() (UUID) with storage.foldername(name)[1] (text)

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update their own parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own parking images" ON storage.objects;
DROP POLICY IF EXISTS "Users can only access their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins can update verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own verification docs" ON storage.objects;

-- Create new policies with proper UUID handling
CREATE POLICY "Users can update their own parking images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'parking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own parking images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'parking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can insert their own parking images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'parking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verification document policies
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND (
    is_admin(auth.uid()) 
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can insert their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own verification documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'verification-docs' 
  AND (
    is_admin(auth.uid()) 
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- Create verification bucket policies for the 'verification' bucket
CREATE POLICY "Users can view own verification docs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can insert own verification docs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can manage all verification docs" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'verification' 
  AND is_admin(auth.uid())
);

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('parking-images', 'parking-images', true),
  ('verification-docs', 'verification-docs', false),
  ('verification', 'verification', false),
  ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;