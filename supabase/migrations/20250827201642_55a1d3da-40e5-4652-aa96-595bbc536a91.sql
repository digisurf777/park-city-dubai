-- Drop and recreate storage policies for verification documents
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete verification documents" ON storage.objects;

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR is_admin(auth.uid())
  )
);

CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-docs' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete verification documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'verification-docs' AND is_admin(auth.uid()));