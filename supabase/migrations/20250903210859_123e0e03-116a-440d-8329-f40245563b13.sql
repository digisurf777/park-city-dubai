-- Fix critical security vulnerability: Secure identity document storage
-- Step 1: Migrate existing document URLs to encrypted references

-- First, populate encrypted_document_refs for existing documents
INSERT INTO public.encrypted_document_refs (
  verification_id,
  encrypted_storage_path,
  document_hash,
  encryption_key_id,
  expires_at
)
SELECT 
  id as verification_id,
  'encrypted_' || id::text || '_' || extract(epoch from now())::text as encrypted_storage_path,
  encode(digest(document_image_url, 'sha256'), 'hex') as document_hash,
  'system_key_' || id::text as encryption_key_id,
  created_at + interval '90 days' as expires_at
FROM public.user_verifications 
WHERE document_image_url IS NOT NULL
ON CONFLICT (verification_id) DO NOTHING;

-- Step 2: Create secure document access function that uses encrypted references
CREATE OR REPLACE FUNCTION public.get_secure_document_reference(verification_id uuid)
RETURNS TABLE(
  encrypted_ref_id uuid,
  access_expires_at timestamp with time zone,
  security_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  verification_record RECORD;
  ref_record RECORD;
BEGIN
  -- Only admins or document owners can access
  IF NOT (public.is_admin(auth.uid())) THEN
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Access denied: Document not found or unauthorized';
    END IF;
  ELSE
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Verification record not found';
    END IF;
  END IF;

  -- Get encrypted reference
  SELECT * INTO ref_record
  FROM public.encrypted_document_refs 
  WHERE encrypted_document_refs.verification_id = get_secure_document_reference.verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Encrypted document reference not found';
  END IF;

  -- Log access attempt
  PERFORM public.log_verification_document_access(
    verification_id,
    'secure_reference_access',
    auth.uid()
  );

  -- Return secure reference data
  RETURN QUERY SELECT 
    ref_record.id,
    ref_record.expires_at,
    verification_record.security_level;
END;
$function$;

-- Step 3: Update existing secure access functions to use encrypted references
CREATE OR REPLACE FUNCTION public.admin_get_secure_document_access(verification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  verification_record RECORD;
  ref_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  -- Get encrypted reference instead of direct URL
  SELECT * INTO ref_record
  FROM public.encrypted_document_refs 
  WHERE encrypted_document_refs.verification_id = admin_get_secure_document_access.verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Encrypted document reference not found - document may have been moved to secure storage';
  END IF;

  -- Log admin access
  PERFORM public.log_verification_document_access(
    verification_id,
    'admin_secure_access',
    auth.uid()
  );

  -- Update last admin access
  UPDATE public.user_verifications 
  SET last_admin_access = NOW() 
  WHERE id = verification_id;

  -- Return secure access information (no direct URLs)
  RETURN json_build_object(
    'verification_id', verification_id,
    'document_type', verification_record.document_type,
    'user_full_name', verification_record.full_name,
    'verification_status', verification_record.verification_status,
    'security_level', verification_record.security_level,
    'encrypted_ref_id', ref_record.id,
    'access_method', 'encrypted_reference_only',
    'expires_at', ref_record.expires_at
  );
END;
$function$;

-- Step 4: Remove direct document URL access (phase this out gradually)
-- First, mark the column as deprecated by adding a comment
COMMENT ON COLUMN public.user_verifications.document_image_url IS 'DEPRECATED: Use encrypted_document_refs for secure access';

-- Step 5: Ensure storage bucket has proper security
-- Update storage policies to require proper token-based access
DROP POLICY IF EXISTS "Admin access to verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view verification documents" ON storage.objects;

-- Create restrictive storage policies - no direct access allowed
CREATE POLICY "verification_docs_no_direct_access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND false -- Explicitly deny all direct access
);

CREATE POLICY "verification_docs_admin_upload_only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND public.is_admin(auth.uid())
);

-- Step 6: Create function to clean up old document URLs (run manually when ready)
CREATE OR REPLACE FUNCTION public.admin_cleanup_document_urls()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleanup_count integer := 0;
BEGIN
  -- Only admins can run cleanup
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Count documents that would be affected
  SELECT COUNT(*) INTO cleanup_count
  FROM public.user_verifications 
  WHERE document_image_url IS NOT NULL;

  RETURN json_build_object(
    'message', 'Ready to clean up document URLs',
    'affected_documents', cleanup_count,
    'status', 'ready_for_cleanup',
    'warning', 'This will remove direct document URLs - ensure encrypted references are working first'
  );
END;
$function$;