-- Fix the handle_new_user_signup trigger to remove conflicting email sending
-- This will allow Supabase's native email confirmation to work properly

-- Drop the existing trigger that causes conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to only create profiles, not send emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  -- Only insert into profiles table, let Supabase handle email confirmation
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    user_type, 
    email_confirmed_at
  )
  VALUES (
    NEW.id,
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
    RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger with the fixed function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove the problematic handle_new_user_signup function entirely
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Remove the send_welcome_email_async function as well
DROP FUNCTION IF EXISTS public.send_welcome_email_async(text, text);