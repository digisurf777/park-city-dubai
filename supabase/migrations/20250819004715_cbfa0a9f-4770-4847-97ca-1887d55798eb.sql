-- Now add CASCADE foreign key constraints to ensure proper cleanup when users are deleted

-- Add CASCADE to profiles table
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to user_roles table
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to user_verifications table
ALTER TABLE public.user_verifications 
DROP CONSTRAINT IF EXISTS user_verifications_user_id_fkey;

ALTER TABLE public.user_verifications 
ADD CONSTRAINT user_verifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to user_messages table
ALTER TABLE public.user_messages 
DROP CONSTRAINT IF EXISTS user_messages_user_id_fkey;

ALTER TABLE public.user_messages 
ADD CONSTRAINT user_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to parking_bookings table
ALTER TABLE public.parking_bookings 
DROP CONSTRAINT IF EXISTS parking_bookings_user_id_fkey;

ALTER TABLE public.parking_bookings 
ADD CONSTRAINT parking_bookings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to parking_listings table
ALTER TABLE public.parking_listings 
DROP CONSTRAINT IF EXISTS parking_listings_owner_id_fkey;

ALTER TABLE public.parking_listings 
ADD CONSTRAINT parking_listings_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add CASCADE to driver_owner_messages table
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

-- Add CASCADE to news_comments table
ALTER TABLE public.news_comments 
DROP CONSTRAINT IF EXISTS news_comments_user_id_fkey;

ALTER TABLE public.news_comments 
ADD CONSTRAINT news_comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;