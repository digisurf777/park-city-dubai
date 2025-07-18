-- Remove the custom confirmation email trigger since it conflicts with Supabase's email flow
DROP TRIGGER IF EXISTS on_auth_user_created_send_confirmation ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_confirmation();