-- Drop any existing check constraints on user_type
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Update all existing 'renter' values to 'seeker'
UPDATE public.profiles 
SET user_type = 'seeker' 
WHERE user_type = 'renter';

-- Update any NULL values 
UPDATE public.profiles 
SET user_type = 'seeker' 
WHERE user_type IS NULL;

-- Set default and make NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'seeker';

ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;

-- Add the new constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('seeker', 'owner'));

-- Update the handle_new_user function
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