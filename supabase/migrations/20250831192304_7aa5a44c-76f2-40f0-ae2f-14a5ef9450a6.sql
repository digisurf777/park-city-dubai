-- Phase 1: Fix Critical Database Issues for Authentication (Fixed)

-- 1. Drop ALL existing policies on profiles table first
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Create simple, working RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (is_admin(auth.uid()));

-- 3. Fix handle_new_user trigger to avoid UUID casting issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles table with explicit UUID casting and better error handling
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    user_type, 
    email_confirmed_at
  )
  VALUES (
    NEW.id,  -- NEW.id is already UUID type from auth.users
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

-- 4. Update system settings for reasonable OTP expiry
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES (
  'email_confirmation_expiry_hours',
  '24',
  'Hours before email confirmation tokens expire'
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = '24',
  updated_at = NOW();

-- 5. Ensure trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();