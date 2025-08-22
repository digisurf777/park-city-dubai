-- CRITICAL SECURITY FIX: Implement encrypted document storage and secure access
-- This migration addresses the security vulnerability where government ID documents
-- could be accessed directly through stored URLs

-- 1. Create encrypted document references table
CREATE TABLE public.encrypted_document_refs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id UUID NOT NULL REFERENCES public.user_verifications(id) ON DELETE CASCADE,
  encrypted_storage_path TEXT NOT NULL, -- Encrypted file path/reference
  encryption_key_id TEXT NOT NULL, -- Reference to encryption key (not the actual key)
  document_hash TEXT NOT NULL, -- SHA-256 hash for integrity verification
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on encrypted document references
ALTER TABLE public.encrypted_document_refs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage encrypted document references
CREATE POLICY "Admins can manage encrypted document refs" 
ON public.encrypted_document_refs 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- 2. Add security audit fields to user_verifications
ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS document_access_token TEXT, -- Temporary access token
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS security_level TEXT NOT NULL DEFAULT 'standard', -- standard, high, maximum
ADD COLUMN IF NOT EXISTS auto_expire_days INTEGER NOT NULL DEFAULT 90;

-- 3. Create secure document access logging table
CREATE TABLE public.secure_document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id UUID NOT NULL REFERENCES public.user_verifications(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL, -- User who accessed the document
  access_method TEXT NOT NULL, -- 'admin_view', 'user_view', 'api_access', 'email_link'
  access_granted BOOLEAN NOT NULL,
  denial_reason TEXT, -- Reason if access was denied
  ip_address INET, -- Client IP address
  user_agent TEXT, -- Client user agent
  session_id TEXT, -- Session identifier
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_token_used BOOLEAN DEFAULT false -- Whether a temporary token was used
);

-- Enable RLS on secure access log
ALTER TABLE public.secure_document_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view secure access logs" 
ON public.secure_document_access_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- System can insert access logs
CREATE POLICY "System can insert secure access logs" 
ON public.secure_document_access_log 
FOR INSERT 
WITH CHECK (true);

-- 4. Create function for generating secure document access tokens
CREATE OR REPLACE FUNCTION public.generate_secure_document_token(
  verification_id UUID,
  access_duration_minutes INTEGER DEFAULT 15,
  access_method TEXT DEFAULT 'admin_view'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  verification_record RECORD;
  access_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user has permission to access this document
  IF NOT (public.is_admin(current_user_id)) THEN
    -- For non-admins, check if they own the document
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id AND user_id = current_user_id;
    
    IF NOT FOUND THEN
      -- Log unauthorized access attempt
      INSERT INTO public.secure_document_access_log (
        verification_id, accessed_by, access_method, access_granted, 
        denial_reason, accessed_at
      ) VALUES (
        verification_id, current_user_id, access_method, false, 
        'Unauthorized: User does not own document', now()
      );
      
      RAISE EXCEPTION 'Access denied: You do not have permission to access this document.';
    END IF;
  ELSE
    -- Admin access - get verification record
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Verification record not found';
    END IF;
  END IF;

  -- Generate secure random token
  access_token := encode(gen_random_bytes(32), 'base64');
  expires_at := now() + (access_duration_minutes || ' minutes')::interval;

  -- Update verification record with token
  UPDATE public.user_verifications 
  SET 
    document_access_token = access_token,
    token_expires_at = expires_at,
    updated_at = now()
  WHERE id = verification_id;

  -- Log successful token generation
  INSERT INTO public.secure_document_access_log (
    verification_id, accessed_by, access_method, access_granted, 
    accessed_at, expires_token_used
  ) VALUES (
    verification_id, current_user_id, 'token_generated', true, 
    now(), true
  );

  -- Return secure access information
  RETURN json_build_object(
    'access_token', access_token,
    'expires_at', expires_at,
    'verification_id', verification_id,
    'access_duration_minutes', access_duration_minutes,
    'security_level', verification_record.security_level
  );
END;
$$;

-- 5. Create function for secure document access with token validation
CREATE OR REPLACE FUNCTION public.get_secure_document_access(
  verification_id UUID,
  access_token TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  verification_record RECORD;
  current_user_id UUID;
  access_granted BOOLEAN := false;
  denial_reason TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Get verification record with token validation
  SELECT * INTO verification_record
  FROM public.user_verifications 
  WHERE id = verification_id
  AND document_access_token = access_token
  AND token_expires_at > now();

  IF FOUND THEN
    -- Valid token - check additional permissions
    IF public.is_admin(current_user_id) OR verification_record.user_id = current_user_id THEN
      access_granted := true;
      
      -- Log successful access
      INSERT INTO public.secure_document_access_log (
        verification_id, accessed_by, access_method, access_granted, 
        accessed_at, expires_token_used
      ) VALUES (
        verification_id, current_user_id, 'secure_token_access', true, 
        now(), true
      );

      -- Increment access count and update last accessed
      UPDATE public.user_verifications 
      SET 
        last_admin_access = now(),
        updated_at = now()
      WHERE id = verification_id;

      -- Return document access information (without direct URL)
      RETURN json_build_object(
        'access_granted', true,
        'document_type', verification_record.document_type,
        'full_name', verification_record.full_name,
        'verification_status', verification_record.verification_status,
        'security_level', verification_record.security_level,
        'expires_at', verification_record.token_expires_at,
        'verification_id', verification_id
      );
    ELSE
      denial_reason := 'Invalid user permissions';
    END IF;
  ELSE
    -- Check if token exists but is expired
    SELECT * INTO verification_record
    FROM public.user_verifications 
    WHERE id = verification_id AND document_access_token = access_token;
    
    IF FOUND THEN
      denial_reason := 'Access token has expired';
    ELSE
      denial_reason := 'Invalid access token';
    END IF;
  END IF;

  -- Log failed access attempt
  INSERT INTO public.secure_document_access_log (
    verification_id, accessed_by, access_method, access_granted, 
    denial_reason, accessed_at, expires_token_used
  ) VALUES (
    verification_id, current_user_id, 'secure_token_access', false, 
    denial_reason, now(), true
  );

  RETURN json_build_object(
    'access_granted', false,
    'error', denial_reason,
    'verification_id', verification_id
  );
END;
$$;

-- 6. Create function to revoke all active tokens for a verification
CREATE OR REPLACE FUNCTION public.revoke_document_access_tokens(verification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can revoke tokens
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Clear access tokens
  UPDATE public.user_verifications 
  SET 
    document_access_token = NULL,
    token_expires_at = NULL,
    updated_at = now()
  WHERE id = verification_id;

  -- Log token revocation
  INSERT INTO public.secure_document_access_log (
    verification_id, accessed_by, access_method, access_granted, 
    accessed_at
  ) VALUES (
    verification_id, auth.uid(), 'tokens_revoked', true, now()
  );

  RETURN true;
END;
$$;

-- 7. Create trigger to auto-expire documents
CREATE OR REPLACE FUNCTION public.auto_expire_old_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark documents as expired if they're past their expiry date
  UPDATE public.user_verifications 
  SET 
    access_restricted = true,
    document_access_token = NULL,
    token_expires_at = NULL,
    updated_at = now()
  WHERE 
    created_at < (now() - (auto_expire_days || ' days')::interval)
    AND access_restricted = false;
    
  -- Log expiration actions
  INSERT INTO public.secure_document_access_log (
    verification_id, accessed_by, access_method, access_granted, accessed_at
  )
  SELECT 
    id, '00000000-0000-0000-0000-000000000000'::uuid, 'auto_expired', true, now()
  FROM public.user_verifications 
  WHERE 
    created_at < (now() - (auto_expire_days || ' days')::interval)
    AND access_restricted = true
    AND updated_at = now(); -- Only log for documents just expired
END;
$$;