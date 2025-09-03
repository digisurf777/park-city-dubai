-- Temporarily disable the auth trigger to see if that's causing the UUID conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simpler version that doesn't do complex operations
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only do basic profile creation without complex logic
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'))
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Don't block auth if profile creation fails
    RETURN NEW;
END;
$$;

-- Recreate trigger with simpler function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_simple();