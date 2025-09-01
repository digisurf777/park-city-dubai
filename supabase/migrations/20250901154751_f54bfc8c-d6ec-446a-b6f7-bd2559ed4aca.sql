-- Phase 1: Fix UUID casting issues in database functions

-- First, let's fix the has_role function to remove problematic UUID casting
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

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

-- Also fix is_admin function to ensure no casting issues
DROP FUNCTION IF EXISTS public.is_admin(uuid);

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