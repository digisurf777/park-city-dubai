-- First check if the constraint exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_user_type_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_type_check;
    END IF;
END $$;

-- Add the correct check constraint for user types
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('seeker', 'owner'));

-- Update the handle_new_user function to use correct default
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
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'seeker')
  );
  RETURN NEW;
END;
$$;