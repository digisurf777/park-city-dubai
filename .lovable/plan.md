

# Update Central Park Towers Booking End Date

The booking `0ccb61be-9ac5-4341-8f22-49090c068215` still has the original 12-month values. I'll use the data insert tool to run the UPDATE query directly.

## What will change

| Field | Current | New |
|-------|---------|-----|
| end_time | 2027-03-26 | 2026-10-26 |
| duration_hours | 8640 | 5136 |

## Implementation

Single SQL UPDATE using the insert/update tool:

```sql
UPDATE parking_bookings 
SET 
  end_time = '2026-10-26T00:00:00+00',
  duration_hours = 5136,
  updated_at = now()
WHERE id = '0ccb61be-9ac5-4341-8f22-49090c068215';
```

After execution, I'll verify the record to confirm the change took effect.

