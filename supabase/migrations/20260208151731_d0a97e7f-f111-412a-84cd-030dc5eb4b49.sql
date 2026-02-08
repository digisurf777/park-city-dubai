
UPDATE parking_bookings
SET end_time = '2026-03-19 00:00:00+00',
    updated_at = now()
WHERE id IN (
  '1b528ebb-6c7e-4543-9bf6-af9d83c63574',
  '75e597de-cc40-4191-9208-00e4cb490984'
);
