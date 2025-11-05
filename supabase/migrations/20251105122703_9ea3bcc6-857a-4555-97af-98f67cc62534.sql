-- Fix verification upload issues: RLS policies, missing columns, and status values

-- Step 1: Clean up blocking RLS policies
DROP POLICY IF EXISTS "Users cannot directly access verification table" ON public.user_verifications;

-- Step 2: Add missing columns
ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS nationality TEXT;

ALTER TABLE public.user_verifications 
ADD COLUMN IF NOT EXISTS access_restricted BOOLEAN DEFAULT true;

-- Step 3: Fix verification status values
ALTER TABLE public.user_verifications 
DROP CONSTRAINT IF EXISTS user_verifications_verification_status_check;

ALTER TABLE public.user_verifications 
ADD CONSTRAINT user_verifications_verification_status_check 
CHECK (verification_status IN ('pending', 'approved', 'rejected', 'verified'));

-- Step 4: Ensure proper INSERT policy exists
DROP POLICY IF EXISTS "Users can create verification requests" ON public.user_verifications;

CREATE POLICY "Users can create verification requests"
ON public.user_verifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the UPDATE policy to be more restrictive
DROP POLICY IF EXISTS "Users can update pending verification details" ON public.user_verifications;

CREATE POLICY "Users can update pending verification details"
ON public.user_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND verification_status = 'pending')
WITH CHECK (auth.uid() = user_id AND verification_status = 'pending');