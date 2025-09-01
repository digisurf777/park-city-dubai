-- Phase 1: Fix UUID casting issues by replacing function definitions

-- Replace has_role function without dropping (to avoid dependency issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id  -- Direct UUID comparison, no casting needed
      AND role = _role
  )
$$;

-- Replace is_admin function without dropping (to avoid dependency issues)  
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id  -- Direct UUID comparison, no casting needed
      AND role = 'admin'::app_role
  )
$$;