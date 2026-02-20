
# Update Booking End Date — Faisal Amin / Index Tower

## What Needs to Change

Update a single field on one booking record in the `parking_bookings` table:

- **Booking ID:** `2dfb3c05-38c0-4c04-8587-0f4bb025a977`
- **Customer:** Faisal Amin (mfamin77@gmail.com)
- **Location:** Index Tower, DIFC
- **Current End Date:** February 23rd, 2027 00:00 UTC
- **New End Date:** November 23rd, 2026 00:00 UTC

## SQL to Run

```sql
UPDATE parking_bookings
SET 
  end_time = '2026-11-23 00:00:00+00',
  duration_hours = EXTRACT(EPOCH FROM ('2026-11-23 00:00:00+00'::timestamptz - start_time)) / 3600,
  updated_at = now()
WHERE id = '2dfb3c05-38c0-4c04-8587-0f4bb025a977';
```

This also recalculates `duration_hours` from the original start date (Feb 23 2026) to the new end date (Nov 23 2026), which equals approximately **6480 hours (9 months)**.

## Impact

- The booking card in the Admin Panel will immediately show the corrected end date.
- Monthly anniversary emails and expiry notifications will now use November 23rd, 2026 as the cutoff.
- No emails will be triggered automatically by this change.
- The `cost_aed` field is NOT changed — if the cost needs adjusting for the shorter period, that can be done separately.

## Note on Cost

The current cost is **14,460 AED** (12 months). If the duration is being shortened to 9 months and the cost should be adjusted proportionally, it would be approximately **10,845 AED**. Please confirm if the cost should also be updated.
