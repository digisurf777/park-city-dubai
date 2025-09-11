-- Fix setup_admin_for_current_user to actually grant admin role
CREATE OR REPLACE FUNCTION public.setup_admin_for_current_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID;
  already_admin BOOLEAN;
  result JSON;
BEGIN
  -- Get current authenticated user id
  current_user_id := auth.uid()::uuid;

  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Check if the user already has admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = current_user_id AND role = 'admin'::app_role
  ) INTO already_admin;

  -- Grant admin if not already
  IF NOT already_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Return result
  result := json_build_object(
    'success', true,
    'user_id', current_user_id,
    'is_admin', true,
    'message', CASE WHEN already_admin THEN 'User already has admin role' ELSE 'Admin role granted' END
  );

  RETURN result;
END;
$$;