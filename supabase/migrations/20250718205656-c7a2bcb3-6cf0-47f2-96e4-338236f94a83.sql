-- First, let's fix the data that's causing issues
-- Update all NULL or invalid user_type values to 'seeker'
UPDATE public.profiles 
SET user_type = 'seeker' 
WHERE user_type IS NULL OR user_type NOT IN ('seeker', 'owner');

-- Update the default for the column
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'seeker';

-- Make the column NOT NULL since it should always have a value
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;

-- Now we can safely add the constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('seeker', 'owner'));

-- Update the trigger function
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