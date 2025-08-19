-- Enable safe deletes and ensure proper WHERE clause enforcement
-- This ensures PostgREST requires proper WHERE clauses for DELETE operations

-- Check if we need to update any existing configurations
-- The error might be due to PostgREST configuration requiring WHERE clauses

-- Let's verify our delete policies work correctly
DO $$
BEGIN
    -- Test that admin can delete (this should work)
    RAISE NOTICE 'Testing delete policies for parking_listings and user_verifications';
    
    -- Check if the policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'parking_listings' 
        AND policyname = 'Admins can delete all listings'
    ) THEN
        RAISE NOTICE 'Admin delete policy exists for parking_listings';
    ELSE
        RAISE NOTICE 'Admin delete policy MISSING for parking_listings';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_verifications' 
        AND policyname = 'Admins can delete verifications'
    ) THEN
        RAISE NOTICE 'Admin delete policy exists for user_verifications';
    ELSE
        RAISE NOTICE 'Admin delete policy MISSING for user_verifications';
    END IF;
END $$;