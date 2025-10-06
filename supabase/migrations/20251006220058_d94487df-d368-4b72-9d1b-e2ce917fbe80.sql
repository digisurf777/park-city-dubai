-- Drop and recreate function with verification status
DROP FUNCTION IF EXISTS public.get_user_display_info(uuid);

CREATE FUNCTION public.get_user_display_info(user_uuid uuid)
RETURNS TABLE(full_name text, email text, phone text, verification_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Try to get from profiles first, then fallback to auth.users
  -- Also get verification status from user_verifications
  RETURN QUERY
  SELECT 
    COALESCE(
      p.full_name,
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      TRIM(CONCAT(
        COALESCE(au.raw_user_meta_data->>'firstName', au.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(au.raw_user_meta_data->>'lastName', au.raw_user_meta_data->>'last_name', '')
      )),
      'User'
    )::TEXT as full_name,
    COALESCE(p.email, au.email)::TEXT as email,
    COALESCE(
      p.phone,
      au.raw_user_meta_data->>'phone',
      au.raw_user_meta_data->>'phone_number'
    )::TEXT as phone,
    COALESCE(uv.verification_status, 'not_verified')::TEXT as verification_status
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  LEFT JOIN public.user_verifications uv ON uv.user_id = au.id
  WHERE au.id = user_uuid
  ORDER BY uv.created_at DESC
  LIMIT 1;
END;
$$;