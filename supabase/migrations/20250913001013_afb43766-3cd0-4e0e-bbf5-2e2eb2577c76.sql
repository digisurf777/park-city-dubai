-- Fix the generate_secure_document_token function to properly handle access logging
CREATE OR REPLACE FUNCTION public.generate_secure_document_token(
  verification_id uuid,
  access_duration_minutes integer DEFAULT 15,
  access_method text DEFAULT 'admin_view'
) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  verification_record RECORD;
  access_token text;
  expires_at timestamp with time zone;
  current_user_id uuid;
  result json;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    -- Log failed access attempt with system user for unauthenticated requests
    INSERT INTO public.secure_document_access_log (
      verification_id, accessed_by, access_method, access_granted, 
      denial_reason, accessed_at
    ) VALUES (
      verification_id, '00000000-0000-0000-0000-000000000000'::uuid, 
      access_method, false, 'No authenticated user', now()
    );
    
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;

  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    -- Log failed access attempt
    INSERT INTO public.secure_document_access_log (
      verification_id, accessed_by, access_method, access_granted, 
      denial_reason, accessed_at
    ) VALUES (
      verification_id, current_user_id, access_method, false, 
      'Verification record not found', now()
    );
    
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  -- Check permissions (admin or document owner)
  IF NOT (public.is_admin(current_user_id) OR verification_record.user_id = current_user_id) THEN
    -- Log unauthorized access attempt
    INSERT INTO public.secure_document_access_log (
      verification_id, accessed_by, access_method, access_granted, 
      denial_reason, accessed_at
    ) VALUES (
      verification_id, current_user_id, access_method, false, 
      'Unauthorized: User does not own document and is not admin', now()
    );
    
    RAISE EXCEPTION 'Unauthorized: Access denied';
  END IF;

  -- Generate secure access token
  access_token := encode(gen_random_bytes(32), 'base64');
  expires_at := now() + (access_duration_minutes || ' minutes')::interval;

  -- Update verification record with token
  UPDATE public.user_verifications 
  SET 
    document_access_token = access_token,
    token_expires_at = expires_at,
    last_admin_access = CASE WHEN public.is_admin(current_user_id) THEN now() ELSE last_admin_access END,
    updated_at = now()
  WHERE id = verification_id;

  -- Log successful access grant
  INSERT INTO public.secure_document_access_log (
    verification_id, accessed_by, access_method, access_granted, 
    accessed_at
  ) VALUES (
    verification_id, current_user_id, access_method, true, now()
  );

  -- Return success result
  result := json_build_object(
    'success', true,
    'access_token', access_token,
    'expires_at', expires_at,
    'verification_id', verification_id,
    'document_type', verification_record.document_type,
    'security_level', verification_record.security_level
  );

  RETURN result;
END;
$function$;

-- Create a simpler admin document access function for direct viewing
CREATE OR REPLACE FUNCTION public.admin_get_document_url(verification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  verification_record RECORD;
  current_user_id uuid;
  signed_url text;
  expires_at timestamp with time zone;
BEGIN
  current_user_id := auth.uid();
  
  -- Only admins can use this function
  IF NOT public.is_admin(current_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get verification record
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Verification record not found';
  END IF;

  -- Log admin access
  PERFORM public.log_verification_document_access(
    verification_id, 
    'admin_direct_access', 
    current_user_id
  );

  -- Calculate expiration (15 minutes from now)
  expires_at := now() + '15 minutes'::interval;

  -- Return document information (the frontend will handle the signed URL generation)
  RETURN json_build_object(
    'success', true,
    'document_image_url', verification_record.document_image_url,
    'document_type', verification_record.document_type,
    'full_name', verification_record.full_name,
    'verification_status', verification_record.verification_status,
    'expires_at', expires_at
  );
END;
$function$;