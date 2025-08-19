-- Add CASCADE delete to profiles table to ensure when a user is deleted from auth.users, 
-- their profile is automatically deleted as well

-- First check current foreign key constraint
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'profiles'
    AND c.contype = 'f';

-- Drop existing foreign key if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add new foreign key with CASCADE delete
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Also ensure other user-related tables cascade properly
-- Check user_roles table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'user_roles'
    AND c.contype = 'f';

-- Update user_roles foreign key to cascade
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check user_verifications table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'user_verifications'
    AND c.contype = 'f';

-- Update user_verifications foreign key to cascade
ALTER TABLE public.user_verifications 
DROP CONSTRAINT IF EXISTS user_verifications_user_id_fkey;

ALTER TABLE public.user_verifications 
ADD CONSTRAINT user_verifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check user_messages table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'user_messages'
    AND c.contype = 'f';

-- Update user_messages foreign key to cascade
ALTER TABLE public.user_messages 
DROP CONSTRAINT IF EXISTS user_messages_user_id_fkey;

ALTER TABLE public.user_messages 
ADD CONSTRAINT user_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check parking_bookings table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'parking_bookings'
    AND c.contype = 'f';

-- Update parking_bookings foreign key to cascade
ALTER TABLE public.parking_bookings 
DROP CONSTRAINT IF EXISTS parking_bookings_user_id_fkey;

ALTER TABLE public.parking_bookings 
ADD CONSTRAINT parking_bookings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check parking_listings table  
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'parking_listings'
    AND c.contype = 'f';

-- Update parking_listings foreign key to cascade
ALTER TABLE public.parking_listings 
DROP CONSTRAINT IF EXISTS parking_listings_owner_id_fkey;

ALTER TABLE public.parking_listings 
ADD CONSTRAINT parking_listings_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check driver_owner_messages table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'driver_owner_messages'
    AND c.contype = 'f';

-- Update driver_owner_messages foreign keys to cascade
ALTER TABLE public.driver_owner_messages 
DROP CONSTRAINT IF EXISTS driver_owner_messages_driver_id_fkey;

ALTER TABLE public.driver_owner_messages 
ADD CONSTRAINT driver_owner_messages_driver_id_fkey 
FOREIGN KEY (driver_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.driver_owner_messages 
DROP CONSTRAINT IF EXISTS driver_owner_messages_owner_id_fkey;

ALTER TABLE public.driver_owner_messages 
ADD CONSTRAINT driver_owner_messages_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Check news_comments table
SELECT 
    conname,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' 
    AND t.relname = 'news_comments'
    AND c.contype = 'f';

-- Update news_comments foreign key to cascade
ALTER TABLE public.news_comments 
DROP CONSTRAINT IF EXISTS news_comments_user_id_fkey;

ALTER TABLE public.news_comments 
ADD CONSTRAINT news_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;