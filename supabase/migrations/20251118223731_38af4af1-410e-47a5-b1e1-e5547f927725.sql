-- Fix existing bookings that have admin-uploaded invoices in owner_payments
-- Update booking.invoice_url to match the owner_payment.invoice_url

UPDATE parking_bookings pb
SET 
  invoice_url = op.invoice_url,
  updated_at = now()
FROM owner_payments op
WHERE pb.id = op.booking_id
  AND op.invoice_url IS NOT NULL
  AND op.invoice_url != pb.invoice_url
  AND pb.id = op.booking_id;

-- Log the updates
DO $$
DECLARE
  update_count INTEGER;
BEGIN
  GET DIAGNOSTICS update_count = ROW_COUNT;
  RAISE NOTICE 'Updated % booking invoice URLs to match admin-uploaded invoices', update_count;
END $$;
