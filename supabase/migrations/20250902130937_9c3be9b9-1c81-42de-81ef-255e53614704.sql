-- Fix the core UUID casting functions that are causing auth errors
-- This addresses the "operator does not exist: uuid = character varying" errors

-- 1. Fix the is_admin function with proper UUID casting
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- 2. Fix the has_role function with proper UUID casting
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Ensure the admin user has admin role
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for the admin email
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'anwerhammad479@gmail.com'
  LIMIT 1;
  
  -- Insert admin role if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;