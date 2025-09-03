-- CRITICAL FIX: Correct auth.refresh_tokens.user_id column type mismatch
-- This fixes the "Database error granting user" issue preventing all authentication

-- Fix the schema mismatch where user_id is VARCHAR instead of UUID
ALTER TABLE auth.refresh_tokens 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Verify the fix by ensuring proper foreign key constraint exists
-- (This may already exist, but we ensure it's properly established)
DO $$
BEGIN
    -- Check if foreign key constraint exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%refresh_tokens_user_id_fkey%' 
        AND table_name = 'refresh_tokens' 
        AND table_schema = 'auth'
    ) THEN
        ALTER TABLE auth.refresh_tokens 
        ADD CONSTRAINT refresh_tokens_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;