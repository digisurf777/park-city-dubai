-- Fix RLS policies for news table to allow proper admin access
DROP POLICY IF EXISTS "Admin can manage news posts" ON public.news;
DROP POLICY IF EXISTS "Admins can view all news posts including drafts" ON public.news;

-- Create proper RLS policies for news management
CREATE POLICY "Admins can manage all news posts"
  ON public.news
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Update the setup_admin_user function to work with current users
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the current authenticated user
    admin_user_id := auth.uid();
    
    -- If user is authenticated, make them admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;