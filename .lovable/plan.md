

# Update Booking Dates — Kirill / The Lofts Central Tower

## What Needs to Change

Update the start and end dates on Kirill's booking:

- **Booking ID:** `a0f9dc28-2368-48e9-9a37-b30cbae2b379`
- **Customer:** Kirill (m31641740@gmail.com)
- **Location:** The Lofts Central Tower
- **Current Dates:** February 26, 2026 → March 26, 2026
- **New Dates:** February 27, 2026 → March 27, 2026

## SQL to Run

```sql
UPDATE parking_bookings
SET 
  start_time = '2026-02-27 00:00:00+00',
  end_time = '2026-03-27 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-03-27 00:00:00+00'::timestamptz - '2026-02-27 00:00:00+00'::timestamptz)) / 3600,
  updated_at = now()
WHERE id = 'a0f9dc28-2368-48e9-9a37-b30cbae2b379';
```

Duration remains ~672 hours (28 days / 1 month). Cost stays at 1,300 AED.

## Impact

- The booking card in the Admin Panel will show the updated dates immediately.
- No emails are triggered by this change.
- The payment link and pre-authorization are unaffected.

