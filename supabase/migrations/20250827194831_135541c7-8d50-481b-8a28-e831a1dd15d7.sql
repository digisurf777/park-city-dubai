-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Also ensure users can view their own uploaded documents
CREATE POLICY "Users can view their own verification documents" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND (
    is_admin(auth.uid()) 
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);