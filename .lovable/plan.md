

# Update DAMAC Park Towers Booking Dates

## Booking Details
- **Booking ID:** `ea7595be-4d78-4884-ac80-c57c477e7fe9`
- **Driver:** Brendan McDonald (brendanjmcdonald@hotmail.com)
- **Owner:** Szymon (szymon.d7@gmail.com)
- **Location:** Covered parking in DAMAC Park Towers
- **Current Dates:** February 1, 2026 to August 1, 2026
- **New Dates:** January 29, 2026 to July 29, 2026
- **Cost:** Stays at 6,540 AED (unchanged)

## What Will Be Updated

Run a single data update on the `parking_bookings` table:
- `start_time` changes from Feb 1 to **Jan 29, 2026**
- `end_time` changes from Aug 1 to **Jul 29, 2026**
- `duration_hours` recalculated to match (~4,344 hours for 181 days)

## Monthly Emails Will Automatically Go Out on the 29th

The monthly email system (`check-monthly-emails`) determines email send dates based on the **day of the booking's start date**. By changing the start date to January 29, the system will automatically send both driver check-in and owner payout emails on the **29th of each month** instead of the 1st. No code changes needed -- this is handled by the existing anniversary logic.

## Technical Details

```sql
UPDATE parking_bookings
SET 
  start_time = '2026-01-29 00:00:00+00',
  end_time = '2026-07-29 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-07-29 00:00:00+00'::timestamptz - '2026-01-29 00:00:00+00'::timestamptz)) / 3600,
  updated_at = now()
WHERE id = 'ea7595be-4d78-4884-ac80-c57c477e7fe9';
```

No emails are triggered by this change, and the payment/pre-authorization is unaffected.
