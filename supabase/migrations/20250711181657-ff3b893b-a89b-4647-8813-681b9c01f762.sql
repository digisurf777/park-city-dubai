-- Add admin role for the correct user
INSERT INTO public.user_roles (user_id, role)
VALUES ('0d00f13b-a97f-4000-9546-a224b80ce24c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;