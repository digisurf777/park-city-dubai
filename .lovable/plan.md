
# Extend Sky Gardens Bookings to March 19, 2026

## What will change

Two confirmed Sky Gardens bookings will have their `end_time` updated from **Feb 19, 2026** to **March 19, 2026**:

| Driver | Owner | Current End | New End |
|--------|-------|-------------|---------|
| Tayler Jade Sani | Jewel Concordia | Feb 19 | March 19 |
| Tania Diab | Fatima Shafqat Hussain | Feb 19 | March 19 |

## Technical Details

A single `UPDATE` statement on the `parking_bookings` table targeting the two booking IDs:

- `1b528ebb-6c7e-4543-9bf6-af9d83c63574` (Tayler / Jewel)
- `75e597de-cc40-4191-9208-00e4cb490984` (Tania / Fatima)

Sets `end_time` to `2026-03-19 00:00:00+00`. No schema changes or code modifications are needed.

This extension will also allow the monthly email system to trigger anniversary emails on Feb 19 (the monthly anniversary date), since the bookings will still be active at that point.
