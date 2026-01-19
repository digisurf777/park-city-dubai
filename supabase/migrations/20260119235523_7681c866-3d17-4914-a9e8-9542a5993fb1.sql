-- Update payout_email_sent_at for Edward Sollis's booking after manually sending the owner email
UPDATE parking_bookings
SET payout_email_sent_at = NOW()
WHERE id = 'fad839f7-86e2-44c3-a30f-efc03c5363a5';