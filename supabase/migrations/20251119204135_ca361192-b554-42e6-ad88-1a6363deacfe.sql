-- Grant admin role to legal@shazam.ae
INSERT INTO user_roles (user_id, role)
VALUES ('6df81ddc-06a3-44d3-b0c2-c2c92e23544f', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role was granted
DO $$
DECLARE
  role_added BOOLEAN;
BEGIN
  -- Check if role was added
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles
    WHERE user_id = '6df81ddc-06a3-44d3-b0c2-c2c92e23544f' AND role = 'admin'
  ) INTO role_added;
  
  IF role_added THEN
    RAISE NOTICE 'SUCCESS: Admin role granted to legal@shazam.ae (user_id: 6df81ddc-06a3-44d3-b0c2-c2c92e23544f)';
  ELSE
    RAISE WARNING 'FAILED: Could not grant admin role to legal@shazam.ae';
  END IF;
END $$;