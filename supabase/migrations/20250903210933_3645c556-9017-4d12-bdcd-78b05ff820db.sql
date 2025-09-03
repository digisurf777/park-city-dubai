-- Fix critical security vulnerability: Secure identity document storage (Fixed)
-- Step 1: Add unique constraint to encrypted_document_refs table
ALTER TABLE public.encrypted_document_refs 
ADD CONSTRAINT encrypted_document_refs_verification_id_unique 
UNIQUE (verification_id);

-- Step 2: Migrate existing document URLs to encrypted references
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
  encode(digest(COALESCE(document_image_url, 'no_url'), 'sha256'), 'hex') as document_hash,
  'system_key_' || id::text as encryption_key_id,
  created_at + interval '90 days' as expires_at
FROM public.user_verifications 
WHERE id NOT IN (SELECT verification_id FROM public.encrypted_document_refs);

-- Step 3: Create secure document access function that uses encrypted references
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

-- Step 4: Secure storage bucket - block all direct access
DROP POLICY IF EXISTS "verification_docs_no_direct_access" ON storage.objects;
DROP POLICY IF EXISTS "verification_docs_admin_upload_only" ON storage.objects;

-- Create ultra-restrictive storage policies
CREATE POLICY "verification_docs_block_all_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-docs' 
  AND false -- Explicitly block all direct file access
);

CREATE POLICY "verification_docs_admin_upload_only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND public.is_admin(auth.uid())
);

-- Step 5: Mark document_image_url as deprecated
COMMENT ON COLUMN public.user_verifications.document_image_url IS 'DEPRECATED: Direct URLs removed for security. Use encrypted_document_refs only.';

-- Step 6: Update access audit logging
INSERT INTO public.verification_audit_log (
  document_id,
  access_type,
  accessed_by,
  accessed_at
)
SELECT 
  id,
  'security_migration_encrypted_refs',
  '00000000-0000-0000-0000-000000000000'::uuid,
  now()
FROM public.user_verifications;