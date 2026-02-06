

# Simplify Chat Email Notification Schedule

## What Changes

The notification escalation strategy will be simplified from 3 fast reminders to just 1:

| Reminder | Current | New |
|----------|---------|-----|
| 1st | T+3 min | T+5 min |
| 2nd | T+18 min | T+24 hours |
| 3rd | T+33 min | T+48 hours |
| 4th+ | Every 24h | Every 24h |
| Stop | After 7 days | After 7 days |

## Technical Details

**1 SQL migration** to update the `get_chats_needing_notification` database function.

The escalation logic inside the `WHERE` clause will be simplified from:

```text
Phase 1 (count < 3): 3 min, then 15 min gaps
Phase 2 (count >= 3): every 24 hours
```

To:

```text
Phase 1 (count = 0): 5 minutes after first unread message
Phase 2 (count >= 1): every 24 hours
```

The 7-day cutoff remains unchanged.

No edge function or frontend changes are needed -- only the database function controls the schedule.

