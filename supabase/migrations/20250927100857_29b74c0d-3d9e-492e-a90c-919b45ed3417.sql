-- Create RPC to fetch basic user info from auth.users for admins
CREATE OR REPLACE FUNCTION public.get_user_basic_info(user_ids uuid[])
RETURNS TABLE(user_id uuid, full_name text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    au.id AS user_id,
    COALESCE(
      NULLIF(au.raw_user_meta_data->>'full_name', ''),
      CASE 
        WHEN (au.raw_user_meta_data->>'firstName') IS NOT NULL OR (au.raw_user_meta_data->>'lastName') IS NOT NULL
        THEN CONCAT(COALESCE(au.raw_user_meta_data->>'firstName',''), ' ', COALESCE(au.raw_user_meta_data->>'lastName',''))
        ELSE NULL
      END,
      p.full_name
    ) AS full_name,
    au.email AS email
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = ANY(user_ids);
END;
$$;