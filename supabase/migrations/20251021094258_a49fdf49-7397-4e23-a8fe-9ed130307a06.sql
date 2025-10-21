-- Insert missing profiles for users who have auth records but no profile
INSERT INTO profiles (user_id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Unknown User'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;