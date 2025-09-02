-- Fix admin setup by using proper user_type values
-- The profiles table user_type should stay as 'seeker' or 'owner' while admin privileges are handled via user_roles

-- Create a function to setup admin privileges for any authenticated user
CREATE OR REPLACE FUNCTION public.setup_admin_for_authenticated_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    current_user_id UUID;
    result JSON;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Create profile if it doesn't exist (using 'seeker' as default type)
    INSERT INTO public.profiles (user_id, full_name, user_type, created_at, updated_at)
    VALUES (
        current_user_id, 
        'Admin User', 
        'seeker', 
        NOW(), 
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = COALESCE(profiles.full_name, 'Admin User'),
        updated_at = NOW();
    
    -- Assign admin role (this is where admin privileges are actually granted)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'message', 'Admin role assigned successfully'
    );
END;
$function$;

-- Ensure the existing admin user has a proper profile
DO $$ 
DECLARE
    admin_user_id UUID := '0d00f13b-a97f-4000-9546-a224b80ce24c';
BEGIN
    -- Ensure admin has a profile with compatible user_type
    INSERT INTO public.profiles (user_id, full_name, user_type, created_at, updated_at)
    VALUES (
        admin_user_id, 
        'System Admin', 
        'seeker', 
        NOW(), 
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = 'System Admin',
        updated_at = NOW();
    
    RAISE LOG 'Admin profile ensured for user: %', admin_user_id;
END $$;