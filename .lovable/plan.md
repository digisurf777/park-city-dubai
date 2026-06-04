## Goals
- Keep both personal and admin users signed in when they close and reopen the mobile browser shortly after.
- Make admin authenticator codes verify reliably on the first valid entry.
- Restore the improved popup-style support chat and stop missing support messages from disappearing.
- Apply the improved chat-window pattern to support, booking chat, and admin chat monitoring.

## What I’ll change

### 1) Stabilize auth/session persistence
- Refactor auth bootstrap in `src/hooks/useAuth.tsx` so session restore is driven by an initial `getSession()` pass plus non-blocking auth state updates, preventing the app from treating a still-restoring session as logged out.
- Remove remaining forced-refresh / hard-reset behavior around logout and route transitions where it can interrupt persisted auth on mobile.
- Audit guarded pages (`ProtectedRoute`, `Auth`, admin validation flow) so redirects wait for auth readiness instead of reacting to a transient `INITIAL_SESSION no user` state.
- Keep explicit logout working, but limit cleanup to targeted Supabase auth keys only.

### 2) Make admin MFA deterministic
- Consolidate MFA challenge ownership so only one place creates or refreshes a challenge during admin login/reauth.
- Stop `Auth.tsx` and `MFARequiredGuard.tsx` from competing to create challenges for the same factor during session transitions.
- Keep verification on a fresh challenge, but add submission guarding and a stable “current challenge” flow so the UI cannot race itself.
- Preserve the AAL2 handoff after verification without forcing reloads that can bounce the user back into MFA.

### 3) Remove the support chat regression in admin
- Eliminate the duplicate legacy “Live Chat Management” surface in `src/pages/AdminPanel.tsx` as the primary admin support inbox path.
- Use the improved `SupportDashboard` experience as the single admin support-chat UI so mobile no longer falls back to the old scroll-heavy screen.
- Keep admin reply, unread counts, AI drafting, and thread selection behavior intact while removing duplicated state that currently drifts out of sync.

### 4) Restore full support message history reliably
- Extend the support dashboard loading strategy so the conversation list can stay performant, but the selected user thread always loads complete history.
- Apply the same full-thread logic already added in `AdminPanel.tsx` to the actual mounted support inbox, so newer messages like the missing Ethesy relist request appear in the correct thread.
- Preserve existing thread state during refresh/realtime updates instead of replacing it with capped global results.

### 5) Unify the chat-window layout across the platform
- Keep the floating support `ChatWidget` as the main user support experience and ensure it resumes the active thread instead of feeling reset.
- Refactor `DriverOwnerChat`, `ActiveBookingChats`, and `BookingChatsMonitor` to share the improved popup/drawer-style interaction pattern rather than separate long-scroll layouts.
- Make admin booking monitoring and user booking chat feel like the same system structurally, while preserving their existing permissions and moderation tools.

### 6) Validate end-to-end
- Verify session persistence across refresh and close/reopen flows for both normal and admin users.
- Verify admin login + MFA from a clean sign-in, including the first valid code path.
- Verify support chat shows the improved mobile layout and that selected threads render the latest messages.
- Verify booking chat and booking-monitor chat open in the improved window-style layout and remain usable on mobile.

## Technical details
- **Auth files:** `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx`, `src/components/MFARequiredGuard.tsx`, `src/components/ProtectedRoute.tsx`, `src/utils/authUtils.ts`
- **Support chat files:** `src/App.tsx`, `src/components/ChatWidget.tsx`, `src/components/admin/SupportDashboard.tsx`, `src/pages/AdminPanel.tsx`
- **Booking chat files:** `src/components/DriverOwnerChat.tsx`, `src/components/ActiveBookingChats.tsx`, `src/components/BookingChatsMonitor.tsx`
- **Root causes confirmed:** transient auth restore being treated as signed-out, overlapping MFA challenge flows, duplicate admin support UIs, and support inboxes relying on capped/global message loads instead of full selected-thread fetches.
- **Database:** no schema change planned unless validation exposes an RPC/RLS gap while loading full support threads.