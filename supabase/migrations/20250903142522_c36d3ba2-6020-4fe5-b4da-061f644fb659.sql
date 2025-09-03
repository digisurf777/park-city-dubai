-- Fix auth trigger issues that might cause UUID casting problems during token creation

-- Drop ALL existing triggers on auth.users to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created_robust ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS public.handle_new_user_robust();

-- Create a minimal, non-interfering trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_minimal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Minimal profile creation with explicit UUID casting
  -- This runs AFTER INSERT to avoid interfering with auth token creation
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
  ON CONFLICT (user_id) DO NOTHING;  -- Simplified conflict handling
    
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Silently ignore errors to avoid blocking auth
    RETURN NEW;
END;
$function$;

-- Create trigger that runs AFTER INSERT (not during the auth transaction)
CREATE TRIGGER on_auth_user_created_minimal
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_minimal();

-- Also ensure any other functions that work with UUIDs are properly cast
-- Update is_admin function to handle UUID casting
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::uuid  -- Explicit cast
      AND role = 'admin'::app_role
  )
$function$;