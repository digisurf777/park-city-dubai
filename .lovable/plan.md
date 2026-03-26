

## Extend Damac Heights Booking to 7 May 2026

### Booking identified
- **ID**: `b50a9fc6-a7b8-4af4-87b0-bb7d4f03c2e6`
- **Location**: Covered parking in Damac Heights
- **Current period**: 7 March 2026 → 7 April 2026 (720 hours)
- **New period**: 7 March 2026 → 7 May 2026 (~1464 hours)
- **Status**: confirmed

### Change
Run a single SQL migration to update the booking's `end_time` and `duration_hours`:

```sql
UPDATE parking_bookings
SET end_time = '2026-05-07 00:00:00+00',
    duration_hours = 1464,
    updated_at = now()
WHERE id = 'b50a9fc6-a7b8-4af4-87b0-bb7d4f03c2e6';
```

No code or schema changes needed — data-only update via migration.

