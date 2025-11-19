-- Grant admin role to legal@shazam.ae
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'legal@shazam.ae'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role was granted
DO $$
DECLARE
  user_exists BOOLEAN;
  role_added BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'legal@shazam.ae'
  ) INTO user_exists;
  
  -- Check if role was added
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    WHERE au.email = 'legal@shazam.ae' AND ur.role = 'admin'
  ) INTO role_added;
  
  IF NOT user_exists THEN
    RAISE NOTICE 'WARNING: User with email legal@shazam.ae does not exist yet. They need to sign up first.';
  ELSIF role_added THEN
    RAISE NOTICE 'SUCCESS: Admin role granted to legal@shazam.ae';
  ELSE
    RAISE NOTICE 'INFO: Admin role already exists for legal@shazam.ae';
  END IF;
END $$;