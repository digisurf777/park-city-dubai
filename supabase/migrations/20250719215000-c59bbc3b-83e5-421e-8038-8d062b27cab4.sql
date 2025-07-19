-- Remove the problematic signup trigger temporarily to get basic signup working
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Ensure the handle_new_user trigger works properly for profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();