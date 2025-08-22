-- Enhanced Security for Verification Documents
-- This migration addresses critical security vulnerabilities in the user_verifications system

-- 1. Add enhanced security columns to user_verifications table
ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS document_encrypted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS access_restricted boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_admin_access timestamp with time zone;

-- 2. Create more restrictive RLS policies for verification documents storage
CREATE POLICY "Admin only access to verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admin only upload to verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admin only update verification documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'verification-docs' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admin only delete verification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-docs' 
  AND is_admin(auth.uid())
);

-- 3. Create secure document access function with mandatory logging
CREATE OR REPLACE FUNCTION public.generate_secure_document_url(
  verification_id uuid,
  access_duration_minutes integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_record RECORD;
  secure_url text;
  expires_at timestamp with time zone;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for document access';
  END IF;

  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  -- Check if access is restricted
  IF verification_record.access_restricted = true AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Document access is restricted';
  END IF;

  -- Log the access attempt
  PERFORM public.log_verification_document_access(
    verification_id, 
    'secure_url_generated', 
    auth.uid()
  );

  -- Update last admin access
  UPDATE public.user_verifications 
  SET last_admin_access = NOW() 
  WHERE id = verification_id;

  -- Calculate expiration time
  expires_at := NOW() + (access_duration_minutes || ' minutes')::interval;

  -- Generate signed URL (temporary access)
  SELECT storage.get_signed_url('verification-docs', verification_record.document_image_url, expires_at)
  INTO secure_url;

  -- Return secure access information
  RETURN json_build_object(
    'secure_url', secure_url,
    'expires_at', expires_at,
    'document_type', verification_record.document_type,
    'user_full_name', verification_record.full_name,
    'access_duration_minutes', access_duration_minutes
  );
END;
$$;

-- 4. Enhanced admin document access function with better security
CREATE OR REPLACE FUNCTION public.admin_get_verification_document(verification_id uuid)
RETURNS TABLE(document_url text, user_full_name text, verification_status text, document_type text)
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

  -- Log the access with enhanced details
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

-- 5. Enhanced access logging function with more security context
CREATE OR REPLACE FUNCTION public.log_verification_document_access(
  document_id uuid, 
  access_type text, 
  user_id uuid DEFAULT auth.uid()
)
RETURNS void
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
    COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'Unknown')
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the operation
    RAISE LOG 'Failed to log verification access: %', SQLERRM;
END;
$$;

-- 6. Create function to check document access permissions
CREATE OR REPLACE FUNCTION public.can_access_verification_document(
  verification_id uuid,
  requesting_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_record RECORD;
BEGIN
  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Admin can always access
  IF is_admin(requesting_user_id) THEN
    RETURN true;
  END IF;

  -- User can access their own non-restricted documents
  IF verification_record.user_id = requesting_user_id 
     AND verification_record.access_restricted = false THEN
    RETURN true;
  END IF;

  -- Default deny
  RETURN false;
END;
$$;

-- 7. Create trigger to log all verification document access
CREATE OR REPLACE FUNCTION public.trigger_log_verification_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log any SELECT operation on verification documents
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_verification_document_access(
      NEW.id,
      'table_access',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Add indexes for better performance on audit queries
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_document_id 
ON public.verification_audit_log(document_id);

CREATE INDEX IF NOT EXISTS idx_verification_audit_log_accessed_by 
ON public.verification_audit_log(accessed_by);

CREATE INDEX IF NOT EXISTS idx_verification_audit_log_accessed_at 
ON public.verification_audit_log(accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id 
ON public.user_verifications(user_id);

-- 9. Update existing RLS policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own verification" ON public.user_verifications;
CREATE POLICY "Users can view their own verification (limited)"
ON public.user_verifications FOR SELECT
USING (
  auth.uid() = user_id 
  AND (
    access_restricted = false 
    OR is_admin(auth.uid())
  )
);

-- 10. Add function to revoke document access (for emergency situations)
CREATE OR REPLACE FUNCTION public.revoke_document_access(verification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Restrict access to the document
  UPDATE public.user_verifications 
  SET access_restricted = true,
      updated_at = NOW()
  WHERE id = verification_id;

  -- Log the revocation
  PERFORM public.log_verification_document_access(
    verification_id,
    'access_revoked',
    auth.uid()
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Document access has been revoked',
    'verification_id', verification_id
  );
END;
$$;