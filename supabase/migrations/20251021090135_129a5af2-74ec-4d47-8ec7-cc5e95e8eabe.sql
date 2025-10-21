-- Create helper to resolve names/emails for a list of users (admin-only)
CREATE OR REPLACE FUNCTION public.get_user_identities(user_ids uuid[])
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id AS user_id,
    COALESCE(
      NULLIF(TRIM(p.full_name), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''),
      'Customer'
    )::text AS full_name,
    COALESCE(NULLIF(TRIM(p.email), ''), NULLIF(TRIM(u.email), ''))::text AS email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE u.id = ANY(user_ids);
END;
$$;