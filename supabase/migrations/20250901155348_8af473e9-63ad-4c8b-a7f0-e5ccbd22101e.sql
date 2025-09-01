-- Ensure all existing users have proper roles assigned
-- First, create a 'user' role in the app_role enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'user' role exists in the enum, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'app_role'::regtype) THEN
        ALTER TYPE app_role ADD VALUE 'user';
    END IF;
END $$;

-- Assign default 'user' role to all existing users who don't have any roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'user'::app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;