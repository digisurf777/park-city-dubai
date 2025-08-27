-- Fix RLS policies for user verifications to allow users to upload their own documents

-- First, let's check the current policies
-- DROP existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can insert their own verification" ON public.user_verifications;
DROP POLICY IF EXISTS "Users can update their own verification" ON public.user_verifications;
DROP POLICY IF EXISTS "Users can view their own verification (limited)" ON public.user_verifications;

-- Create proper RLS policies for user verifications
CREATE POLICY "Users can insert their own verification" 
ON public.user_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification" 
ON public.user_verifications 
FOR UPDATE 
USING (auth.uid() = user_id AND verification_status = 'pending');

CREATE POLICY "Users can view their own verification" 
ON public.user_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure the verification-docs storage bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-docs', 'verification-docs', false) 
ON CONFLICT (id) DO NOTHING;

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