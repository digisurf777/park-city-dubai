-- Create owner_payments table
CREATE TABLE public.owner_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.parking_listings(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.parking_bookings(id) ON DELETE SET NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_aed NUMERIC(10, 2) NOT NULL,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  payment_method TEXT DEFAULT 'Bank Transfer',
  reference_number TEXT,
  invoice_url TEXT,
  remittance_advice_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all owner payments"
ON public.owner_payments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Owners can view their own payments"
ON public.owner_payments
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Create storage bucket for payment documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'owner-payment-documents',
  'owner-payment-documents',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf']::text[]
);

-- Storage RLS policies
CREATE POLICY "Admins can upload payment documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'owner-payment-documents' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can manage payment documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'owner-payment-documents' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Owners can view their payment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'owner-payment-documents'
  AND (
    is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.owner_payments op
      WHERE op.owner_id = auth.uid()
      AND (
        storage.foldername(name))[1] = op.id::text
      )
    )
);

-- Function to get owner payment history
CREATE OR REPLACE FUNCTION public.get_owner_payment_history()
RETURNS TABLE(
  id uuid,
  owner_id uuid,
  owner_name text,
  owner_email text,
  listing_id uuid,
  listing_title text,
  booking_id uuid,
  payment_date timestamp with time zone,
  amount_aed numeric,
  payment_period_start date,
  payment_period_end date,
  payment_method text,
  reference_number text,
  invoice_url text,
  remittance_advice_url text,
  notes text,
  status text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    op.id,
    op.owner_id,
    COALESCE(p.full_name, au.raw_user_meta_data->>'full_name', 'Unknown Owner') as owner_name,
    COALESCE(p.email, au.email) as owner_email,
    op.listing_id,
    pl.title as listing_title,
    op.booking_id,
    op.payment_date,
    op.amount_aed,
    op.payment_period_start,
    op.payment_period_end,
    op.payment_method,
    op.reference_number,
    op.invoice_url,
    op.remittance_advice_url,
    op.notes,
    op.status,
    op.created_at
  FROM public.owner_payments op
  LEFT JOIN public.profiles p ON p.user_id = op.owner_id
  LEFT JOIN auth.users au ON au.id = op.owner_id
  LEFT JOIN public.parking_listings pl ON pl.id = op.listing_id
  ORDER BY op.payment_date DESC, op.created_at DESC;
END;
$$;

-- Function for owners to get their own payments
CREATE OR REPLACE FUNCTION public.get_my_payment_history()
RETURNS TABLE(
  id uuid,
  listing_title text,
  payment_date timestamp with time zone,
  amount_aed numeric,
  payment_period_start date,
  payment_period_end date,
  payment_method text,
  reference_number text,
  invoice_url text,
  remittance_advice_url text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.id,
    pl.title as listing_title,
    op.payment_date,
    op.amount_aed,
    op.payment_period_start,
    op.payment_period_end,
    op.payment_method,
    op.reference_number,
    op.invoice_url,
    op.remittance_advice_url,
    op.status
  FROM public.owner_payments op
  LEFT JOIN public.parking_listings pl ON pl.id = op.listing_id
  WHERE op.owner_id = auth.uid()
  ORDER BY op.payment_date DESC, op.created_at DESC;
END;
$$;