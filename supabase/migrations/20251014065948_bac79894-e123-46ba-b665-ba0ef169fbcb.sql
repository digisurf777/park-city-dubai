-- Disable MFA requirement for all users
UPDATE public.user_mfa_requirements 
SET mfa_required = false, updated_at = now()
WHERE mfa_required = true;

-- Temporarily disable the trigger that auto-enforces MFA for admins
DROP TRIGGER IF EXISTS enforce_admin_mfa ON public.user_roles;