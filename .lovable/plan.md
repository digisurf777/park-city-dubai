## What I’ll fix

1. **Stop the repeated logout problem** for both personal and admin accounts so closing the phone browser/app and reopening shortly after keeps the user signed in.
2. **Fix the admin authenticator flow** so the correct code is accepted consistently on the first valid attempt instead of failing several times.
3. **Restore the improved support chat experience** so mobile users get the newer chat-window style layout instead of the older scroll-heavy screen.
4. **Fix disappearing chat history** so recent user/admin messages remain visible, including the missing newer support messages.
5. **Apply the improved chat layout across the platform** for support chat, booking chat, and admin monitoring views.

## Plan

### 1) Stabilize session persistence
- Remove the aggressive auth-token clearing that is wiping valid Supabase sessions during normal login/OAuth/logout error paths.
- Replace broad storage clearing with **targeted logout-only cleanup** so normal navigation, app restarts, and OAuth callbacks do not destroy persisted credentials.
- Tighten auth bootstrap so the app restores the saved session cleanly before route guards redirect users to `/auth`.
- Keep the existing persistent Supabase client config, but make the surrounding app logic stop fighting it.

### 2) Fix admin MFA verification races
- Consolidate the MFA challenge flow so only **one place owns challenge creation and verification** during admin login.
- Stop creating/recreating challenges from multiple effects/guards while the user is mid-verification.
- Verify against the intended enrolled factor instead of relying on whichever factor is first in the returned list.
- Remove forced full-page reload behavior after MFA verification and replace it with a controlled AAL2/session handoff before admin validation runs.
- Add submission guarding so duplicate verify attempts don’t create misleading “wrong code” failures.

### 3) Remove the support chat regression
- Unify the admin support surfaces so the old “Live Chat Management” path no longer overrides the newer support inbox/chat experience.
- Reuse the improved conversation layout patterns already present in the newer support UI for mobile and desktop.
- Preserve selected thread, scroll position to newest messages, and compose area visibility on mobile.

### 4) Fix missing/disappearing support messages
- Make support-thread loading use a stable source of truth so thread lists and thread bodies don’t drift apart.
- Preserve the current thread while refreshes and realtime updates run, instead of replacing it with partial results.
- Keep the recent-global fetch for overview performance, but always load the **full selected thread** when a conversation is opened.
- Verify the missing newer messages are present in the database and ensure the UI renders them in the correct conversation.

### 5) Roll the improved chat window pattern into booking and user-to-user chat
- Refactor booking chat and admin booking-monitor chat to use the same popup/drawer-style interaction model instead of long page scrolling.
- Keep each chat’s existing permissions/business rules, while only changing the presentation/state flow needed for the better mobile experience.
- Align support chat, booking chat, and admin monitoring so they feel like one coherent system rather than three separate chat products.

### 6) Validate the full end-to-end behavior
- Test personal account session persistence across refresh, close/reopen, and short idle periods.
- Test admin sign-in + MFA from a clean login and confirm the same correct code works immediately.
- Verify the newer support layout is what appears in admin and mobile views.
- Confirm the missing recent support messages show up in the correct conversation.
- Confirm booking/user chats open in the improved window-style layout and remain usable on mobile.

## Technical details
- **Likely files:** `src/hooks/useAuth.tsx`, `src/utils/authUtils.ts`, `src/pages/Auth.tsx`, `src/pages/MyAccount.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/MFARequiredGuard.tsx`, `src/pages/AdminPanel.tsx`, `src/components/admin/SupportDashboard.tsx`, `src/components/ChatWidget.tsx`, `src/components/DriverOwnerChat.tsx`, `src/components/BookingChatsMonitor.tsx`, `src/components/ActiveBookingChats.tsx`, `src/components/UserInbox.tsx`.
- **Primary causes already identified:** token wiping in auth/logout flows, duplicated MFA challenge logic, duplicated support/admin chat implementations, and partial chat refresh patterns.
- **Database:** I do **not** expect a schema migration for the first pass. If implementation exposes an RPC/RLS gap while validating missing messages, I’ll add a focused migration then.
- **Important constraint:** keep manual logout working exactly as logout, while preventing ordinary app reopen/navigation from behaving like logout.