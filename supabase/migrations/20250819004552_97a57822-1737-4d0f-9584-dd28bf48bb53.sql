-- Clean up orphaned user data before adding CASCADE constraints
-- First, check for orphaned records in each table

-- Check orphaned records in user_verifications
SELECT uv.id, uv.user_id, uv.full_name 
FROM user_verifications uv 
LEFT JOIN auth.users au ON uv.user_id = au.id 
WHERE au.id IS NULL;

-- Check orphaned records in user_roles  
SELECT ur.id, ur.user_id, ur.role 
FROM user_roles ur 
LEFT JOIN auth.users au ON ur.user_id = au.id 
WHERE au.id IS NULL;

-- Check orphaned records in profiles
SELECT p.id, p.user_id, p.full_name 
FROM profiles p 
LEFT JOIN auth.users au ON p.user_id = au.id 
WHERE au.id IS NULL;

-- Check orphaned records in user_messages
SELECT um.id, um.user_id, um.subject 
FROM user_messages um 
LEFT JOIN auth.users au ON um.user_id = au.id 
WHERE au.id IS NULL;

-- Check orphaned records in parking_bookings
SELECT pb.id, pb.user_id, pb.location 
FROM parking_bookings pb 
LEFT JOIN auth.users au ON pb.user_id = au.id 
WHERE au.id IS NULL;

-- Check orphaned records in parking_listings
SELECT pl.id, pl.owner_id, pl.title 
FROM parking_listings pl 
LEFT JOIN auth.users au ON pl.owner_id = au.id 
WHERE au.id IS NULL;

-- Clean up orphaned records
-- Remove orphaned user_verifications
DELETE FROM user_verifications 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned user_roles
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned profiles
DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned user_messages
DELETE FROM user_messages 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned parking_bookings
DELETE FROM parking_bookings 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned parking_listings
DELETE FROM parking_listings 
WHERE owner_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned driver_owner_messages
DELETE FROM driver_owner_messages 
WHERE driver_id NOT IN (SELECT id FROM auth.users)
   OR owner_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned news_comments
DELETE FROM news_comments 
WHERE user_id NOT IN (SELECT id FROM auth.users);