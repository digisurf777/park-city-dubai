-- Create booking_invoices table for multiple invoices per booking
CREATE TABLE IF NOT EXISTS booking_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES parking_bookings(id) ON DELETE CASCADE,
  invoice_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_size_bytes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_invoices_booking_id ON booking_invoices(booking_id);

-- Enable RLS
ALTER TABLE booking_invoices ENABLE ROW LEVEL SECURITY;

-- Customers can view invoices for their bookings
CREATE POLICY "Customers can view their booking invoices"
  ON booking_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parking_bookings pb
      WHERE pb.id = booking_invoices.booking_id
      AND pb.user_id = auth.uid()
    )
  );

-- Admins can manage all invoices
CREATE POLICY "Admins can manage all invoices"
  ON booking_invoices FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));