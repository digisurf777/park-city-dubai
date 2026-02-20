UPDATE parking_bookings
SET 
  end_time = '2026-11-23 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-11-23 00:00:00+00'::timestamptz - start_time)) / 3600,
  updated_at = now()
WHERE id = '2dfb3c05-38c0-4c04-8587-0f4bb025a977';