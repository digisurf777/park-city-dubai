-- Add unique constraints to fix upsert operations in edge functions
-- This will allow the create-or-update-admin function to work properly

-- Add unique constraint on profiles.user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_id_unique'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Add unique constraint on user_roles(user_id, role) if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_role_unique'
    ) THEN
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);
    END IF;
END $$;

-- Ensure the specific admin user exists in auth.users table
-- This creates the user with confirmed email if they don't exist
-- Note: This should be handled by the edge function, but we ensure it here as backup