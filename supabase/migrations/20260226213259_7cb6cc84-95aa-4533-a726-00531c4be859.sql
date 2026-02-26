UPDATE parking_bookings
SET 
  start_time = '2026-01-29 00:00:00+00',
  end_time = '2026-07-29 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-07-29 00:00:00+00'::timestamptz - '2026-01-29 00:00:00+00'::timestamptz)) / 3600,
  updated_at = now()
WHERE id = 'ea7595be-4d78-4884-ac80-c57c477e7fe9';