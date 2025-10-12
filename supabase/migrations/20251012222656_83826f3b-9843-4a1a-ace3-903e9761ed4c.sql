-- Table to track MFA requirements for admin users
CREATE TABLE IF NOT EXISTS public.user_mfa_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mfa_required boolean DEFAULT false NOT NULL,
  mfa_enabled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_mfa_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage MFA requirements"
  ON public.user_mfa_requirements
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view their own MFA requirements"
  ON public.user_mfa_requirements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically require MFA for admins
CREATE OR REPLACE FUNCTION public.require_mfa_for_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_mfa_requirements (user_id, mfa_required)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      mfa_required = true, 
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to enforce MFA requirement on admin role assignment
CREATE TRIGGER on_admin_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.require_mfa_for_admins();

-- Backfill existing admins
INSERT INTO public.user_mfa_requirements (user_id, mfa_required)
SELECT user_id, true
FROM public.user_roles
WHERE role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET mfa_required = true;