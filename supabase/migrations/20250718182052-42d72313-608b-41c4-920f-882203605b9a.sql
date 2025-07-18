
-- Ensure the trigger exists for automatically creating user profiles and handling email confirmation
-- First, let's make sure the handle_new_user function is updated to include user_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'renter')
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (this will recreate it if it already exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add email_confirmed_at column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email_confirmed_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
