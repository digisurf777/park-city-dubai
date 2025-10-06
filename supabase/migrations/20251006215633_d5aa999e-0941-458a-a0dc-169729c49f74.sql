-- Create function to get user display info with fallback to auth.users
CREATE OR REPLACE FUNCTION public.get_user_display_info(user_uuid uuid)
RETURNS TABLE(full_name text, email text, phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Try to get from profiles first, then fallback to auth.users
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
    )::TEXT as phone
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = user_uuid
  LIMIT 1;
END;
$$;