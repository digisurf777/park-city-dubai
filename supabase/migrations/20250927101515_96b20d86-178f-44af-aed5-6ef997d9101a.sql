-- Improve RPC: handle multiple metadata keys for name and ensure email fallback
CREATE OR REPLACE FUNCTION public.get_user_basic_info(user_ids uuid[])
RETURNS TABLE(user_id uuid, full_name text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    au.id AS user_id,
    COALESCE(
      NULLIF(au.raw_user_meta_data->>'full_name', ''),
      NULLIF(au.raw_user_meta_data->>'fullName', ''),
      NULLIF(au.raw_user_meta_data->>'name', ''),
      NULLIF(
        TRIM(
          CONCAT(
            COALESCE(au.raw_user_meta_data->>'firstName', au.raw_user_meta_data->>'first_name', ''),
            ' ',
            COALESCE(au.raw_user_meta_data->>'lastName', au.raw_user_meta_data->>'last_name', '')
          )
        ), ''
      ),
      NULLIF(
        TRIM(
          CONCAT(
            COALESCE(au.raw_user_meta_data->>'given_name', ''), ' ', COALESCE(au.raw_user_meta_data->>'family_name', '')
          )
        ), ''
      ),
      p.full_name
    ) AS full_name,
    au.email AS email
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  WHERE au.id = ANY(user_ids);
END;
$$;