-- Add nationality column to user_verifications table
ALTER TABLE public.user_verifications 
ADD COLUMN nationality text;