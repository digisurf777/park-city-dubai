-- ===============================================
-- FIX SECURITY WARNINGS: Function Search Path Issues
-- ===============================================

-- Fix search_path for all functions that were missing it
-- This prevents SQL injection attacks via search_path manipulation

-- 1. Fix log_profile_access function
CREATE OR REPLACE FUNCTION public.log_profile_access(
  target_user_id UUID,
  access_type TEXT,
  fields_accessed TEXT[] DEFAULT ARRAY[]::TEXT[],
  access_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_access_audit (
    profile_user_id,
    accessed_by,
    access_type,
    fields_accessed,
    access_reason,
    accessed_at
  ) VALUES (
    target_user_id,
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    access_type,
    fields_accessed,
    access_reason,
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block operation
    RAISE LOG 'Failed to log profile access: %', SQLERRM;
END;
$$;

-- 2. Fix admin_get_profile_secure function
CREATE OR REPLACE FUNCTION public.admin_get_profile_secure(
  target_user_id UUID,
  include_sensitive_fields BOOLEAN DEFAULT FALSE,
  access_reason TEXT DEFAULT 'admin_access'
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  user_type TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  signup_notified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
  fields_accessed TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get the profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE profiles.user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user ID: %', target_user_id;
  END IF;

  -- Prepare fields accessed list
  fields_accessed := ARRAY['user_id', 'full_name', 'user_type', 'email_confirmed_at', 'created_at', 'updated_at', 'signup_notified'];
  
  IF include_sensitive_fields THEN
    fields_accessed := fields_accessed || ARRAY['phone'];
  END IF;

  -- Log the access
  PERFORM public.log_profile_access(
    target_user_id,
    CASE 
      WHEN include_sensitive_fields THEN 'admin_full_access'
      ELSE 'admin_basic_access'
    END,
    fields_accessed,
    access_reason
  );

  -- Return data (with or without sensitive fields)
  RETURN QUERY SELECT 
    profile_record.user_id,
    profile_record.full_name,
    CASE 
      WHEN include_sensitive_fields THEN profile_record.phone
      ELSE CASE 
        WHEN profile_record.phone IS NOT NULL THEN '***-***-' || RIGHT(profile_record.phone, 4)
        ELSE NULL
      END
    END as phone,
    profile_record.user_type,
    profile_record.email_confirmed_at,
    profile_record.created_at,
    profile_record.updated_at,
    profile_record.signup_notified;
END;
$$;

-- 3. Fix admin_list_profiles_secure function
CREATE OR REPLACE FUNCTION public.admin_list_profiles_secure(
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 50,
  include_sensitive_fields BOOLEAN DEFAULT FALSE,
  search_term TEXT DEFAULT NULL,
  access_reason TEXT DEFAULT 'admin_list_access'
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  user_type TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_records BIGINT;
  fields_accessed TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate pagination parameters
  IF page_limit > 100 THEN
    RAISE EXCEPTION 'Page limit cannot exceed 100 records';
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_records
  FROM public.profiles p
  WHERE (search_term IS NULL OR 
         p.full_name ILIKE '%' || search_term || '%' OR 
         p.user_type ILIKE '%' || search_term || '%');

  -- Prepare fields accessed list
  fields_accessed := ARRAY['user_id', 'full_name', 'user_type', 'email_confirmed_at', 'created_at'];
  
  IF include_sensitive_fields THEN
    fields_accessed := fields_accessed || ARRAY['phone'];
  END IF;

  -- Log the bulk access (log once for the query, not per row)
  PERFORM public.log_profile_access(
    '00000000-0000-0000-0000-000000000000'::UUID, -- Special UUID for bulk operations
    CASE 
      WHEN include_sensitive_fields THEN 'admin_bulk_list_sensitive'
      ELSE 'admin_bulk_list_basic'
    END,
    fields_accessed,
    access_reason || ' - page: ' || page_offset || ', limit: ' || page_limit || ', search: ' || COALESCE(search_term, 'none')
  );

  -- Return paginated results
  RETURN QUERY 
  SELECT 
    p.user_id,
    p.full_name,
    CASE 
      WHEN include_sensitive_fields THEN p.phone
      ELSE CASE 
        WHEN p.phone IS NOT NULL THEN '***-***-' || RIGHT(p.phone, 4)
        ELSE NULL
      END
    END as phone,
    p.user_type,
    p.email_confirmed_at,
    p.created_at,
    total_records as total_count
  FROM public.profiles p
  WHERE (search_term IS NULL OR 
         p.full_name ILIKE '%' || search_term || '%' OR 
         p.user_type ILIKE '%' || search_term || '%')
  ORDER BY p.created_at DESC
  OFFSET page_offset
  LIMIT page_limit;
END;
$$;

-- 4. Fix admin_emergency_profile_access function
CREATE OR REPLACE FUNCTION public.admin_emergency_profile_access(
  target_user_id UUID,
  emergency_reason TEXT
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  user_type TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  signup_notified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Require explicit reason for emergency access
  IF emergency_reason IS NULL OR LENGTH(TRIM(emergency_reason)) < 10 THEN
    RAISE EXCEPTION 'Emergency access requires a detailed reason (minimum 10 characters)';
  END IF;

  -- Get profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE profiles.user_id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user ID: %', target_user_id;
  END IF;

  -- Log emergency access with high priority
  PERFORM public.log_profile_access(
    target_user_id,
    'admin_emergency_access',
    ARRAY['user_id', 'full_name', 'phone', 'user_type', 'email_confirmed_at', 'created_at', 'updated_at', 'signup_notified'],
    'EMERGENCY: ' || emergency_reason
  );

  -- Return full profile data
  RETURN QUERY SELECT 
    profile_record.user_id,
    profile_record.full_name,
    profile_record.phone,
    profile_record.user_type,
    profile_record.email_confirmed_at,
    profile_record.created_at,
    profile_record.updated_at,
    profile_record.signup_notified;
END;
$$;

-- 5. Fix get_profile_access_stats function
CREATE OR REPLACE FUNCTION public.get_profile_access_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  access_date DATE,
  access_type TEXT,
  access_count BIGINT,
  unique_admins BIGINT,
  unique_profiles_accessed BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can view access statistics
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    DATE(accessed_at) as access_date,
    access_type,
    COUNT(*) as access_count,
    COUNT(DISTINCT accessed_by) as unique_admins,
    COUNT(DISTINCT profile_user_id) as unique_profiles_accessed
  FROM public.profile_access_audit
  WHERE accessed_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(accessed_at), access_type
  ORDER BY access_date DESC, access_type;
END;
$$;