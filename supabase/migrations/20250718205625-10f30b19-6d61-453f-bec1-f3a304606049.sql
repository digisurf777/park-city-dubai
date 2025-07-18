-- First update any existing 'renter' values to 'seeker'
UPDATE public.profiles 
SET user_type = 'seeker' 
WHERE user_type = 'renter' OR user_type IS NULL OR user_type NOT IN ('seeker', 'owner');

-- Also update the default value in the column definition
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'seeker';

-- Now add the check constraint
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