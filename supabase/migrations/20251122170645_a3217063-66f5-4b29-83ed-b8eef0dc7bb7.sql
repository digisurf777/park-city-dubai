-- Migrate existing invoices from parking_bookings.invoice_url to booking_invoices table
-- This ensures all old invoices are visible in the new system

INSERT INTO booking_invoices (
  booking_id,
  invoice_number,
  file_path,
  file_name,
  uploaded_by,
  uploaded_at,
  notes
)
SELECT 
  pb.id as booking_id,
  1 as invoice_number,
  pb.invoice_url as file_path,
  substring(pb.invoice_url from '[^/]+$') as file_name,
  COALESCE(
    (SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1),
    pb.user_id
  ) as uploaded_by,
  pb.updated_at as uploaded_at,
  'Migrated from legacy invoice system' as notes
FROM parking_bookings pb
WHERE pb.invoice_url IS NOT NULL
  AND pb.invoice_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM booking_invoices bi 
    WHERE bi.booking_id = pb.id
  );