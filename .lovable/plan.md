## Goal
Make the admin authenticator code work on the **first** correct entry, instead of being rejected ~3 times before being accepted.

## Root cause
The app creates several TOTP "challenges" at once during admin login, and the verify step also creates its own. Each new challenge invalidates the previous one and the rapid burst hits Supabase's MFA challenge rate limit. So the verify call's own challenge creation intermittently fails or races, and the correct code is rejected until the noise settles (~30s / a few retries).

Today, challenges are created in **four** places for the same login:
- `src/pages/Auth.tsx` → `handleLogin` (on successful admin password login)
- `src/pages/Auth.tsx` → `maybeRedirectOrChallenge` effect (fires again when `user` changes)
- `src/pages/Auth.tsx` → `handleMFAVerification` error-retry branch
- `src/components/MFARequiredGuard.tsx` → validation effect

Meanwhile `verifyMFAChallenge` in `src/hooks/useAuth.tsx` *already* creates a fresh challenge right before verifying (and ignores any passed id). So all the pre-created challenges are pure noise that cause the failure.

## Fix
Adopt a single rule: **only `verifyMFAChallenge` creates a challenge, exactly once, at the moment the user submits the code.** Everywhere else just shows the code-entry UI — no challenge pre-creation.

### 1) `src/pages/Auth.tsx`
- In `handleLogin`: when an admin is at AAL1 with a verified TOTP factor, stop calling `challengeMFA`. Just set the factor id, show the MFA prompt (`setShowMFAChallenge(true)`), and prompt for the code. No challenge id needed.
- In the `maybeRedirectOrChallenge` effect: same change — for admin + AAL1, show the MFA prompt without calling `challengeMFA`.
- In `handleMFAVerification` error branch: remove the "recreate challenge" retry block. Since verify makes its own fresh challenge each call, the user simply re-enters the code.
- Keep the success path (AAL2 wait + server `validate-admin-access` recheck + redirect) unchanged.

### 2) `src/components/MFARequiredGuard.tsx`
- Remove the challenge-creation logic from the validation effect (the `challengeMFA` call and `challengePreparedRef`). For admin + AAL1 with MFA enabled, just show the code-entry screen (`setShowMFAChallenge(true)`).
- `handleMFAVerify` continues to call `verifyMFAChallenge` (which creates the single fresh challenge internally), then sets `verified` on success — no reload.

### 3) `src/hooks/useAuth.tsx`
- `verifyMFAChallenge` already creates one fresh challenge before verifying; keep it as the sole challenge creator.
- Add a simple in-flight guard (a ref/flag) so a double-submit cannot fire two concurrent verifies (which would create two challenges again).
- Leave the AAL2 confirmation poll as-is.

## Validation
- Sign in as admin with password, enter the correct 6-digit code once → should verify on the first try and land on `/admin`.
- Confirm an incorrect code shows an error and a subsequent correct code still works.
- Confirm the `MFARequiredGuard` path (navigating directly to `/admin` while AAL1) also accepts the code on first try.

## Notes
- Frontend-only change; no database, RLS, or edge-function changes.
- `challengeMFA` stays exported (used by enrollment/setup) but is no longer called during the login verify flow.
