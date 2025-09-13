-- Grant admin role to the current user
INSERT INTO public.user_roles (user_id, role)
VALUES ('0d00f13b-a97f-4000-9546-a224b80ce24c', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;