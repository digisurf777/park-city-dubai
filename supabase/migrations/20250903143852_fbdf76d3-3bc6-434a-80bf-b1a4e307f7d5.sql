-- Complete removal of all auth triggers to fix token creation issues
-- The error shows our trigger is still interfering with auth token creation

-- Drop ALL triggers on auth.users completely
DROP TRIGGER IF EXISTS on_auth_user_created_minimal ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_robust ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Drop all related functions to ensure clean state
DROP FUNCTION IF EXISTS public.handle_new_user_minimal();
DROP FUNCTION IF EXISTS public.handle_new_user_robust();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_simple();

-- Ensure profiles table allows manual insertion for now
-- We'll handle profile creation through the application instead of triggers
ALTER TABLE public.profiles ALTER COLUMN user_id SET DEFAULT null;

-- Create a simple function for manual profile creation (not triggered)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_full_name text DEFAULT '',
  p_user_type text DEFAULT 'seeker'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (p_user_id, p_full_name, p_user_type)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;