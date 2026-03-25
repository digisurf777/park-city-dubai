

# Plan: Extend Damac Heights Booking to 7 May 2026

## What
Update the existing confirmed booking for Damac Heights to extend the end date by one month.

## Booking Details
- **Booking ID**: `b50a9fc6-a7b8-4af4-87b0-bb7d4f03c2e6`
- **Location**: Covered parking in Damac Heights
- **Current end**: 7 April 2026
- **New end**: 7 May 2026
- **Duration**: 720 → 1464 hours (approx 2 months)

## Change
Run a single SQL update via the insert tool:
```sql
UPDATE parking_bookings
SET end_time = '2026-05-07 00:00:00+00',
    duration_hours = 1464,
    updated_at = now()
WHERE id = 'b50a9fc6-a7b8-4af4-87b0-bb7d4f03c2e6';
```

No code or schema changes needed — this is a data-only update.

