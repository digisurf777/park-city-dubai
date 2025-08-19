-- Fix Critical Security Issues with Identity Documents

-- 1. Remove overly permissive storage policies for verification documents
DROP POLICY IF EXISTS "Authenticated users can view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload verification docs" ON storage.objects;

-- 2. Create secure admin-only access policy for verification documents
CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' AND 
  is_admin(auth.uid())
);

-- 3. Create admin management policies for verification documents
CREATE POLICY "Admins can update verification documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'verification-docs' AND 
  is_admin(auth.uid())
);

CREATE POLICY "Admins can delete verification documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'verification-docs' AND 
  is_admin(auth.uid())
);

-- 4. Ensure verification-docs bucket is private (extra security measure)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'verification-docs';

-- 5. Add audit trail function for verification document access
CREATE OR REPLACE FUNCTION public.log_verification_document_access(
  document_id UUID,
  access_type TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.verification_audit_log (
    document_id,
    access_type,
    accessed_by,
    accessed_at,
    user_agent
  ) VALUES (
    document_id,
    access_type,
    user_id,
    NOW(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the operation
    RAISE LOG 'Failed to log verification access: %', SQLERRM;
END;
$$;

-- 6. Create audit log table for verification document access
CREATE TABLE IF NOT EXISTS public.verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  access_type TEXT NOT NULL,
  accessed_by UUID NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. Enable RLS on audit log table
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for audit log (admin access only)
CREATE POLICY "Admins can view audit logs" 
ON public.verification_audit_log 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" 
ON public.verification_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 9. Add additional security column to user_verifications for document encryption status
ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS document_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_restricted BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_admin_access TIMESTAMP WITH TIME ZONE;

-- 10. Create function to safely retrieve verification documents for admins
CREATE OR REPLACE FUNCTION public.admin_get_verification_document(
  verification_id UUID
)
RETURNS TABLE (
  document_url TEXT,
  user_full_name TEXT,
  verification_status TEXT,
  document_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  -- Log the access
  PERFORM public.log_verification_document_access(
    verification_id, 
    'admin_view', 
    auth.uid()
  );

  -- Update last admin access
  UPDATE public.user_verifications 
  SET last_admin_access = NOW() 
  WHERE id = verification_id;

  -- Return the document information
  RETURN QUERY
  SELECT 
    verification_record.document_image_url,
    verification_record.full_name,
    verification_record.verification_status,
    verification_record.document_type;
END;
$$;

-- 11. Update user_verifications table with access restrictions
UPDATE public.user_verifications 
SET access_restricted = true 
WHERE access_restricted IS NULL;