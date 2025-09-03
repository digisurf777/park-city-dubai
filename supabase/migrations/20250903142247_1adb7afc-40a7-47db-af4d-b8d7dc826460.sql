-- Check and fix potential issues with auth triggers that might cause character varying vs uuid conflicts

-- First, let's see what triggers are currently on auth.users
-- We'll recreate the handle_new_user trigger with better error handling and UUID casting

-- Drop existing triggers to prevent conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Create a more robust trigger function that handles UUID casting properly
CREATE OR REPLACE FUNCTION public.handle_new_user_robust()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure NEW.id is properly cast as UUID to prevent type conflicts
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    user_type, 
    email_confirmed_at
  )
  VALUES (
    NEW.id::uuid,  -- Explicit UUID cast
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'seeker'),
    NEW.email_confirmed_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    user_type = COALESCE(EXCLUDED.user_type, public.profiles.user_type),
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user_robust trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create the trigger with AFTER INSERT to avoid interfering with auth token creation
CREATE TRIGGER on_auth_user_created_robust
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_robust();

-- Also check if there are any functions that might be causing UUID casting issues
-- Let's update any functions that work with user IDs to ensure proper UUID handling

-- Update the setup_admin_for_current_user function to handle UUID casting better
CREATE OR REPLACE FUNCTION public.setup_admin_for_current_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    current_user_id UUID;
    result JSON;
BEGIN
    -- Get the current authenticated user ID with explicit UUID casting
    current_user_id := auth.uid()::uuid;
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Not authenticated'
        );
    END IF;
    
    -- Insert admin role (or update if exists) with explicit UUID casting
    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_user_id::uuid, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'user_id', current_user_id,
        'message', 'Admin role assigned successfully'
    );
END;
$function$;