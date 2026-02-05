
# Driver-Owner Chat System Verification & Fixes

## Current Status

I investigated the chat system and found one critical bug that's breaking notifications:

### Bug Found: Notification State Reset by Wrong User

**Problem:** When the **driver** (message sender) opens the chat, the `mark_booking_messages_read` function resets `notification_timer_active = FALSE` and `first_unread_message_at = NULL`, killing the notification timer for the **owner** (recipient).

**Evidence:** For booking `b3fe9b19`:
- Message sent by driver at 08:52
- `last_read_at` updated to 16:00 (someone opened chat)
- But `read_status = false` (message not marked as read)
- `notification_timer_active = FALSE` (timer killed)
- `first_unread_message_at = NULL` (reset incorrectly)

This means the driver opened the chat, which reset the notification state, but the owner never got an email notification.

---

## Fix Required

Update `mark_booking_messages_read` to **only reset the timer when the recipient marks messages as read**, not when anyone opens the chat.

```sql
-- Only reset timer if the current user actually marked messages as read
-- (i.e., they were the recipient of unread messages)
IF updated_count > 0 THEN
  UPDATE public.chat_notification_state
  SET 
    last_read_at = NOW(),
    notification_timer_active = FALSE,
    first_unread_message_at = NULL,
    updated_at = NOW()
  WHERE booking_id = p_booking_id;
END IF;
```

---

## Verification Checklist

After the fix, the system should work as follows:

| Step | What happens | Email sent? |
|------|-------------|-------------|
| 1. Driver sends message | Timer starts, `first_unread_message_at = NOW()` | No |
| 2. 3 minutes pass | Escalation check runs | **Yes (1st)** |
| 3. Owner doesn't respond | 15 min later | **Yes (2nd)** |
| 4. Still no response | 15 min later | **Yes (3rd)** |
| 5. Still no response | 24 hours later | **Yes (4th)** |
| 6. Owner reads & replies | Timer resets, new cycle for driver | No |
| 7. 7 days no response | Notifications stop | No |

---

## Implementation

1. **Fix `mark_booking_messages_read` function** - Only reset notification state when messages were actually marked as read (updated_count > 0)

2. **Fix current stuck state** - Run one-time query to reactivate timer for bookings with unread messages

---

## Files to Modify

1. **SQL Migration** - Update `mark_booking_messages_read` function

2. **One-time data fix** - Reactivate timers for affected bookings

---

## Summary

The chat messaging works correctly - drivers and owners CAN communicate. The bug is specifically in the notification timer logic: opening the chat (even by the sender) incorrectly resets the notification timer, preventing email notifications from being sent to the actual recipient.
