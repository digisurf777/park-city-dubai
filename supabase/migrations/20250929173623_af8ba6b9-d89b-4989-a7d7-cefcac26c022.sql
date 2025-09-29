-- Create a function to safely get user email from either profiles or auth.users
CREATE OR REPLACE FUNCTION public.get_user_email_and_name(user_uuid UUID)
RETURNS TABLE(email TEXT, full_name TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try to get from profiles
  RETURN QUERY
  SELECT 
    COALESCE(p.email, au.email)::TEXT as email,
    COALESCE(
      p.full_name,
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      'Property Owner'
    )::TEXT as full_name
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = user_uuid
  LIMIT 1;
END;
$$;