-- Fix the is_admin function to ensure proper UUID handling
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid  -- Explicit cast to ensure UUID type
      AND role = 'admin'::app_role
  )
$$;

-- Fix the has_role function to ensure proper UUID handling  
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid  -- Explicit cast to ensure UUID type
      AND role = _role
  )
$$;