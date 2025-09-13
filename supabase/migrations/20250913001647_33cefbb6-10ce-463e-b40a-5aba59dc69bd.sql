-- Fix the is_admin function to ensure it works properly
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$function$;

-- Test the updated function
SELECT public.is_admin('0d00f13b-a97f-4000-9546-a224b80ce24c'::uuid) as admin_check_result;