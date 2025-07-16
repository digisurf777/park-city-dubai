-- Enable email confirmations if not already enabled
-- This will be handled in Supabase dashboard settings

-- Update profiles table to track email confirmation status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signup_notified BOOLEAN DEFAULT FALSE;