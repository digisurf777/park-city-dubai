-- Step 1: Recreate handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'seeker')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Backfill missing profiles for existing users
INSERT INTO public.profiles (user_id, full_name, email, user_type)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', uv.full_name, ''),
  au.email,
  COALESCE(au.raw_user_meta_data->>'user_type', 'seeker')
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
LEFT JOIN user_verifications uv ON uv.user_id = au.id
WHERE p.user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = CASE 
    WHEN profiles.full_name = '' THEN EXCLUDED.full_name 
    ELSE profiles.full_name 
  END;