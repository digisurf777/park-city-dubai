-- Profile repair function to create missing profiles from auth.users
CREATE OR REPLACE FUNCTION public.repair_missing_profiles()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  repaired_count INTEGER := 0;
  missing_profiles RECORD;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Find users with verifications but no profiles
  FOR missing_profiles IN (
    SELECT DISTINCT uv.user_id
    FROM public.user_verifications uv
    LEFT JOIN public.profiles p ON p.user_id = uv.user_id
    WHERE p.user_id IS NULL
  ) LOOP
    -- Get user data from auth.users
    INSERT INTO public.profiles (
      user_id, 
      full_name, 
      email, 
      user_type,
      created_at,
      updated_at
    )
    SELECT 
      au.id,
      CASE 
        WHEN au.raw_user_meta_data->>'full_name' IS NOT NULL 
        THEN au.raw_user_meta_data->>'full_name'
        WHEN au.raw_user_meta_data->>'firstName' IS NOT NULL AND au.raw_user_meta_data->>'lastName' IS NOT NULL
        THEN CONCAT(au.raw_user_meta_data->>'firstName', ' ', au.raw_user_meta_data->>'lastName')
        ELSE 'Unknown User'
      END as full_name,
      au.email,
      COALESCE(au.raw_user_meta_data->>'user_type', 'seeker') as user_type,
      NOW(),
      NOW()
    FROM auth.users au
    WHERE au.id = missing_profiles.user_id
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = CASE 
        WHEN profiles.full_name = 'Unknown User' OR profiles.full_name IS NULL 
        THEN EXCLUDED.full_name 
        ELSE profiles.full_name 
      END,
      user_type = CASE 
        WHEN profiles.user_type IS NULL 
        THEN EXCLUDED.user_type 
        ELSE profiles.user_type 
      END,
      updated_at = NOW();
    
    repaired_count := repaired_count + 1;
  END LOOP;

  result := json_build_object(
    'success', true,
    'repaired_profiles', repaired_count,
    'message', CASE 
      WHEN repaired_count = 0 THEN 'No missing profiles found to repair'
      ELSE 'Successfully repaired ' || repaired_count || ' missing profiles'
    END
  );

  RETURN result;
END;
$$;

-- Enhanced verification view with proper JOIN and fallback data
CREATE OR REPLACE FUNCTION public.get_verifications_with_profiles()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  document_type text,
  document_image_url text,
  verification_status text,
  nationality text,
  created_at timestamp with time zone,
  profile_user_id uuid,
  profile_full_name text,
  profile_email text,
  profile_phone text,
  profile_user_type text,
  auth_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    uv.id,
    uv.user_id,
    uv.full_name,
    uv.document_type,
    uv.document_image_url,
    uv.verification_status,
    uv.nationality,
    uv.created_at,
    p.user_id as profile_user_id,
    p.full_name as profile_full_name,
    p.email as profile_email,
    p.phone as profile_phone,
    p.user_type as profile_user_type,
    au.email as auth_email
  FROM public.user_verifications uv
  LEFT JOIN public.profiles p ON p.user_id = uv.user_id
  LEFT JOIN auth.users au ON au.id = uv.user_id
  ORDER BY uv.created_at DESC;
END;
$$;