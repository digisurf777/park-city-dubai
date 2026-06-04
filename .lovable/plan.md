## Goal
Stop admin chat history from disappearing and make the Live Chat Management tab reliably show all existing conversations and messages.

## What I’ll change
1. **Stabilize how admin chat history is loaded**
   - Refactor the admin chat fetch logic in `src/pages/AdminPanel.tsx` so it uses one consistent source of truth for conversation threads and message history.
   - Prevent the UI from briefly replacing a valid thread list or message list with an empty state during refreshes or realtime updates.

2. **Preserve existing chat data in the UI during refreshes**
   - Avoid clearing the current chat thread while data is reloading.
   - Keep the selected conversation intact when new messages arrive or when the admin panel refreshes its chat data.

3. **Harden realtime update behavior**
   - Review the realtime subscription in the admin panel so inserts/updates in `user_messages` do not cause the chat list/history to flicker, reset, or disappear.
   - Make sure the selected thread still resolves correctly after realtime refreshes.

4. **Check database-side access for admin chat history**
   - Verify that the `user_messages` table and any RPCs used by the admin chat (`get_chat_users_overview`, `get_user_basic_info`) still allow admins to read the data they need.
   - If a policy or RPC issue is hiding older messages or certain users, I’ll prepare the required database migration.

5. **Align the mobile chat screen with the fixed data flow**
   - Ensure the mobile full-screen chat view still shows the full thread history once the underlying fetch/state logic is stabilized.

## Technical details
- Primary frontend file:
  - `src/pages/AdminPanel.tsx`
- Likely data paths involved:
  - `user_messages`
  - `get_chat_users_overview`
  - `get_user_basic_info`
- Likely root cause from current code:
  - The admin chat uses multiple fallback fetch paths and full refreshes on every realtime event, which can temporarily replace populated state with partial or empty results.
  - The thread list and message list are loaded separately, so they can drift out of sync.

## Validation
- Open Admin → Live Chat Management and confirm existing conversations appear consistently.
- Select a thread and confirm older messages remain visible.
- Send/receive a message and confirm the thread stays selected and history does not disappear.
- Reopen the admin panel and confirm prior chat history still loads.

## If database changes are needed
I’ll add a focused migration only if I confirm an RLS/RPC access issue is contributing to the disappearing history.