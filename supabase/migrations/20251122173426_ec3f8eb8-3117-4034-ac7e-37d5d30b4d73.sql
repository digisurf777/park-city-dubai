-- Create owner_payment_documents table for invoice history
CREATE TABLE IF NOT EXISTS public.owner_payment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.owner_payments(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'remittance')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_owner_payment_documents_payment_id 
  ON public.owner_payment_documents(payment_id);
CREATE INDEX IF NOT EXISTS idx_owner_payment_documents_type 
  ON public.owner_payment_documents(payment_id, document_type);

-- Enable RLS
ALTER TABLE public.owner_payment_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all documents
CREATE POLICY "Admins can manage all payment documents"
  ON public.owner_payment_documents
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policy: Owners can view documents for their payments
CREATE POLICY "Owners can view their payment documents"
  ON public.owner_payment_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.owner_payments op
      WHERE op.id = owner_payment_documents.payment_id
      AND op.owner_id = auth.uid()
    )
  );

-- RLS Policy: Customers can view documents for payments linked to their bookings
CREATE POLICY "Customers can view documents for linked bookings"
  ON public.owner_payment_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.owner_payments op
      INNER JOIN public.parking_bookings pb ON pb.id = op.booking_id
      WHERE op.id = owner_payment_documents.payment_id
      AND pb.user_id = auth.uid()
    )
  );

-- Migrate existing invoice documents
INSERT INTO public.owner_payment_documents (
  payment_id,
  document_type,
  file_path,
  file_name,
  uploaded_by,
  uploaded_at,
  created_at
)
SELECT 
  id as payment_id,
  'invoice' as document_type,
  invoice_url as file_path,
  CONCAT('invoice_', id, '.pdf') as file_name,
  owner_id as uploaded_by,
  created_at as uploaded_at,
  created_at
FROM public.owner_payments
WHERE invoice_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Migrate existing remittance documents
INSERT INTO public.owner_payment_documents (
  payment_id,
  document_type,
  file_path,
  file_name,
  uploaded_by,
  uploaded_at,
  created_at
)
SELECT 
  id as payment_id,
  'remittance' as document_type,
  remittance_advice_url as file_path,
  CONCAT('remittance_', id, '.pdf') as file_name,
  owner_id as uploaded_by,
  created_at as uploaded_at,
  created_at
FROM public.owner_payments
WHERE remittance_advice_url IS NOT NULL
ON CONFLICT DO NOTHING;