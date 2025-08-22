-- Fix security warnings by setting search_path for all functions
-- This addresses the Function Search Path Mutable warnings

-- Update generate_secure_document_url function
CREATE OR REPLACE FUNCTION public.generate_secure_document_url(
  verification_id uuid,
  access_duration_minutes integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
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

-- Update admin_get_verification_document function
CREATE OR REPLACE FUNCTION public.admin_get_verification_document(verification_id uuid)
RETURNS TABLE(document_url text, user_full_name text, verification_status text, document_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update log_verification_document_access function
CREATE OR REPLACE FUNCTION public.log_verification_document_access(
  document_id uuid, 
  access_type text, 
  user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update can_access_verification_document function
CREATE OR REPLACE FUNCTION public.can_access_verification_document(
  verification_id uuid,
  requesting_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update trigger_log_verification_access function
CREATE OR REPLACE FUNCTION public.trigger_log_verification_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update revoke_document_access function
CREATE OR REPLACE FUNCTION public.revoke_document_access(verification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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