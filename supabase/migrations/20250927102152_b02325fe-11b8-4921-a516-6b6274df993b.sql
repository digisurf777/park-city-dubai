-- Create overview RPC for chat users with names and unread counts
CREATE OR REPLACE FUNCTION public.get_chat_users_overview()
RETURNS TABLE(user_id uuid, display_name text, unread_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT um.user_id,
           COUNT(*) FILTER (WHERE um.from_admin = false AND um.read_status = false) AS unread_count
    FROM public.user_messages um
    GROUP BY um.user_id
  )
  SELECT 
    b.user_id,
    COALESCE(
      NULLIF(au.raw_user_meta_data->>'full_name',''),
      NULLIF(au.raw_user_meta_data->>'fullName',''),
      NULLIF(au.raw_user_meta_data->>'name',''),
      NULLIF(TRIM(CONCAT(COALESCE(au.raw_user_meta_data->>'firstName', au.raw_user_meta_data->>'first_name',''),' ',COALESCE(au.raw_user_meta_data->>'lastName', au.raw_user_meta_data->>'last_name',''))),''),
      NULLIF(TRIM(CONCAT(COALESCE(au.raw_user_meta_data->>'given_name',''),' ',COALESCE(au.raw_user_meta_data->>'family_name',''))),''),
      p.full_name,
      au.email
    ) AS display_name,
    b.unread_count
  FROM base b
  LEFT JOIN auth.users au ON au.id = b.user_id
  LEFT JOIN public.profiles p ON p.user_id = b.user_id
  ORDER BY b.user_id;
END;
$$;