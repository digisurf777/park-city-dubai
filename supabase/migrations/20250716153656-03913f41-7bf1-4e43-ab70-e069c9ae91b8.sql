-- Update profiles table to track email confirmation and signup notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signup_notified BOOLEAN DEFAULT false;