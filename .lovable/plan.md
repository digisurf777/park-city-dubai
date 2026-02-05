

# Fix Chat Notification Escalation Schedule

## Problem
The current notification system uses a simple "5 min delay + 30 min cooldown" pattern. It does NOT implement the proper escalation strategy you requested.

## Your Required Schedule

```text
Message sent at T=0
  │
  ├── T+3 min   → 1st reminder (notification_count = 1)
  ├── T+18 min  → 2nd reminder (notification_count = 2)  [15 min after 1st]
  ├── T+33 min  → 3rd reminder (notification_count = 3)  [15 min after 2nd]
  │
  ├── T+24 hrs  → 4th reminder (notification_count = 4)
  ├── T+48 hrs  → 5th reminder (notification_count = 5)
  │   ...
  └── T+7 days  → STOP (no more reminders)
```

---

## Implementation Plan

### Step 1: Update `get_chats_needing_notification` Function

Replace the current timing logic with escalation-aware checks:

```sql
CREATE OR REPLACE FUNCTION public.get_chats_needing_notification()
RETURNS TABLE(...)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT ...
  FROM public.chat_notification_state cns
  ...
  WHERE 
    cns.notification_timer_active = TRUE
    AND cns.first_unread_message_at IS NOT NULL
    -- Stop after 7 days of no response
    AND cns.first_unread_message_at > (NOW() - INTERVAL '7 days')
    AND pb.status IN ('confirmed', 'approved')
    AND (
      -- Phase 1: First 3 reminders (count 0, 1, 2 → send at 3, 18, 33 min)
      (cns.notification_count < 3 AND (
        (cns.notification_count = 0 AND cns.first_unread_message_at < NOW() - INTERVAL '3 minutes')
        OR (cns.notification_count = 1 AND cns.last_notification_sent_at < NOW() - INTERVAL '15 minutes')
        OR (cns.notification_count = 2 AND cns.last_notification_sent_at < NOW() - INTERVAL '15 minutes')
      ))
      -- Phase 2: After 3 reminders, once every 24 hours
      OR (cns.notification_count >= 3 AND cns.last_notification_sent_at < NOW() - INTERVAL '24 hours')
    );
END;
$$;
```

### Step 2: Update Edge Function to Increment Count

Modify `send-chat-message-notification` to increment `notification_count` instead of resetting to 0:

```typescript
// After sending email successfully
const { error: updateError } = await supabase
  .from("chat_notification_state")
  .update({
    last_notification_sent_at: new Date().toISOString(),
    notification_count: (currentCount || 0) + 1, // INCREMENT, don't reset
    updated_at: new Date().toISOString(),
    // Remove: notification_cooldown_until (no longer needed)
    // Remove: notification_timer_active = false (let RPC control this)
  })
  .eq("booking_id", chat.booking_id);
```

### Step 3: Update Trigger to Reset Count on New Cycle

The trigger already resets `notification_count = 0` when a new cycle starts (messages read then new message sent) - this is correct.

---

## Files to Modify

1. **New SQL migration** - Update `get_chats_needing_notification` with escalation logic
2. **Edge function** - `supabase/functions/send-chat-message-notification/index.ts` - Increment count

---

## Technical Details

### Escalation Timeline Example

| Time | notification_count | Action |
|------|-------------------|--------|
| T+0 | 0 | Message sent, timer starts |
| T+3 min | 0 → 1 | 1st email sent |
| T+18 min | 1 → 2 | 2nd email sent |
| T+33 min | 2 → 3 | 3rd email sent |
| T+24 hrs | 3 → 4 | 4th email sent |
| T+48 hrs | 4 → 5 | 5th email sent |
| ... | ... | ... |
| T+7 days | - | STOP, no more emails |

### Why Remove `notification_cooldown_until`

The cooldown logic is now implicit in the escalation schedule:
- For count < 3: Wait 15 minutes between notifications
- For count >= 3: Wait 24 hours between notifications
- After 7 days: Stop entirely

The `notification_cooldown_until` column can remain but won't be used.

---

## Summary

This change implements your exact requirements:
- **Max 3 reminders in first ~45 minutes** (at +3, +18, +33 min)
- **After that, max 1 reminder every 24 hours**
- **After 7 days with no response, reminders stop completely**

