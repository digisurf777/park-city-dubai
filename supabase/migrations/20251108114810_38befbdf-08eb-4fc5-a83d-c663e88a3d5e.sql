-- Create banking_details table for parking owners
CREATE TABLE public.banking_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.banking_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own banking details"
ON public.banking_details FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banking details"
ON public.banking_details FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banking details"
ON public.banking_details FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all banking details"
ON public.banking_details FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create audit log for banking details access
CREATE TABLE public.banking_details_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banking_detail_id UUID NOT NULL REFERENCES public.banking_details(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'update', 'admin_view')),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

ALTER TABLE public.banking_details_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.banking_details_access_audit FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.banking_details_access_audit FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_banking_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_banking_details_timestamp
BEFORE UPDATE ON public.banking_details
FOR EACH ROW
EXECUTE FUNCTION public.update_banking_details_updated_at();