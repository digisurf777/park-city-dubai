-- Add unique constraint on user_id in user_verifications to support upsert operations
ALTER TABLE public.user_verifications 
ADD CONSTRAINT user_verifications_user_id_unique UNIQUE (user_id);