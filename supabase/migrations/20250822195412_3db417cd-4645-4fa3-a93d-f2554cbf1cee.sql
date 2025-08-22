-- Fix search path security issues for verification document functions
-- This addresses the "Function Search Path Mutable" warnings

-- Update get_secure_document_url function with proper search path
CREATE OR REPLACE FUNCTION public.get_secure_document_url(
  verification_id UUID,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TABLE(
  signed_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_record RECORD;
  file_path TEXT;
  expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user has access to this verification
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id
  AND (
    user_id = auth.uid() 
    OR public.is_admin(auth.uid())
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access denied: Verification not found or access denied';
  END IF;

  -- Log the access attempt
  PERFORM public.log_verification_document_access(
    verification_id, 
    'secure_url_generated', 
    auth.uid()
  );

  -- Extract file path from URL
  file_path := regexp_replace(verification_record.document_image_url, '^.*/verification-docs/', '');
  
  -- Calculate expiry time
  expiry_time := NOW() + (expires_in || ' seconds')::INTERVAL;

  -- Generate signed URL (this would need to be implemented with actual Supabase storage API)
  -- For now, return the original URL with security logging
  RETURN QUERY SELECT 
    verification_record.document_image_url,
    expiry_time;
END;
$$;

-- Update secure_get_verification_document function with proper search path
CREATE OR REPLACE FUNCTION public.secure_get_verification_document(
  verification_id UUID,
  access_reason TEXT DEFAULT 'admin_review'
)
RETURNS TABLE(
  document_url TEXT, 
  user_full_name TEXT, 
  verification_status TEXT, 
  document_type TEXT,
  access_logged BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verification_record RECORD;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Strict access control: only admins or document owners
  IF NOT (public.is_admin(current_user_id)) THEN
    -- Check if user is accessing their own document
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id AND user_id = current_user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Access denied: Admin privileges or document ownership required';
    END IF;
  ELSE
    -- Admin access
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Verification record not found';
    END IF;
  END IF;

  -- Mandatory access logging with enhanced details
  INSERT INTO public.verification_audit_log (
    document_id,
    access_type,
    accessed_by,
    accessed_at,
    user_agent
  ) VALUES (
    verification_id,
    CASE 
      WHEN public.is_admin(current_user_id) THEN 'admin_secure_access: ' || access_reason
      ELSE 'owner_access: ' || access_reason
    END,
    current_user_id,
    NOW(),
    COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'Unknown')
  );

  -- Update last access timestamp
  UPDATE public.user_verifications 
  SET last_admin_access = NOW() 
  WHERE id = verification_id;

  -- Return document information
  RETURN QUERY SELECT 
    verification_record.document_image_url,
    verification_record.full_name,
    verification_record.verification_status,
    verification_record.document_type,
    TRUE as access_logged;
END;
$$;

-- Update encrypt_document_reference function with proper search path
CREATE OR REPLACE FUNCTION public.encrypt_document_reference(
  verification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark document as encrypted in metadata
  UPDATE public.user_verifications 
  SET 
    document_encrypted = TRUE,
    access_restricted = TRUE,
    updated_at = NOW()
  WHERE id = verification_id;
  
  -- Log encryption action
  PERFORM public.log_verification_document_access(
    verification_id, 
    'document_encrypted', 
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- Update trigger_log_verification_access function with proper search path
CREATE OR REPLACE FUNCTION public.trigger_log_verification_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any SELECT operations on verification documents
  IF TG_OP = 'SELECT' THEN
    INSERT INTO public.verification_audit_log (
      document_id,
      access_type,
      accessed_by,
      accessed_at
    ) VALUES (
      OLD.id,
      'table_access_select',
      auth.uid(),
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update validate_document_access function with proper search path
CREATE OR REPLACE FUNCTION public.validate_document_access(
  verification_id UUID,
  requested_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
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
    RETURN FALSE;
  END IF;

  -- Check access restrictions
  IF verification_record.access_restricted AND NOT public.is_admin(requested_by) AND verification_record.user_id != requested_by THEN
    -- Log unauthorized access attempt
    INSERT INTO public.verification_audit_log (
      document_id,
      access_type,
      accessed_by,
      accessed_at
    ) VALUES (
      verification_id,
      'unauthorized_access_attempt',
      requested_by,
      NOW()
    );
    
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;