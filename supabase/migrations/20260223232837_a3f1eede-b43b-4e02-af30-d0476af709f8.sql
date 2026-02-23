UPDATE parking_bookings
SET 
  start_time = '2026-02-27 00:00:00+00',
  end_time = '2026-03-27 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-03-27 00:00:00+00'::timestamptz - '2026-02-27 00:00:00+00'::timestamptz)) / 3600,
  updated_at = now()
WHERE id = 'a0f9dc28-2368-48e9-9a37-b30cbae2b379';