-- More thorough cleanup of orphaned records
-- Let's check what records still exist that reference non-existent users

-- Find all orphaned user_verifications records
SELECT uv.id, uv.user_id, uv.full_name 
FROM user_verifications uv 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = uv.user_id);

-- Delete all orphaned user_verifications records
DELETE FROM user_verifications 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = user_verifications.user_id);

-- Find all orphaned profiles records
SELECT p.id, p.user_id, p.full_name 
FROM profiles p 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.user_id);

-- Delete all orphaned profiles records
DELETE FROM profiles 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = profiles.user_id);

-- Find all orphaned user_roles records
SELECT ur.id, ur.user_id, ur.role 
FROM user_roles ur 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = ur.user_id);

-- Delete all orphaned user_roles records
DELETE FROM user_roles 
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = user_roles.user_id);

-- Now add CASCADE constraints one by one, starting with profiles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;