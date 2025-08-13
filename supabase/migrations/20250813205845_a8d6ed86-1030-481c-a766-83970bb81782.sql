-- Fix the critical security vulnerability in user_messages table
-- The current admin policy allows public access with "true" condition
-- We need to properly check for admin role using the is_admin() function

-- Drop the vulnerable policy
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.user_messages;

-- Create a secure admin policy that actually checks for admin role
CREATE POLICY "Admins can manage all messages" 
ON public.user_messages 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Also ensure users can only create messages for themselves
-- (Adding missing INSERT policy for users)
CREATE POLICY "Users can create messages for themselves" 
ON public.user_messages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);