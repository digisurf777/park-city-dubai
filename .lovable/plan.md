## Problem

Admin login fails at the MFA step with the toast "Could not start verification. Please try again."

Root cause (from auth + browser logs):

- The Supabase Auth API returns `403: invalid claim: missing sub claim` on `POST /factors/{id}/challenge` and `GET /user` immediately after the access token is issued/refreshed.
- This is a known issue with `@supabase/supabase-js@2.50.x` against projects that have been migrated to the new asymmetric JWT signing keys: the client occasionally hands back a refreshed access token whose payload is missing the `sub` claim, which GoTrue then rejects.
- Effect: `challengeMFA()` fails, the MFA challenge can never be created, and even after the user enters a valid code the AAL2 upgrade never lands (`AAL2 not yet reflected` warning), so the admin route bounces them back.

## Fix

### 1. Upgrade `@supabase/supabase-js` to a version that handles the new JWT signing keys

Bump the dependency in `package.json` from `^2.50.4` to `^2.57.2` (matches what edge functions already pin). This release contains the refresh-token / claim-handling fixes for projects on asymmetric JWT keys and resolves the `missing sub claim` errors.

No code changes are required — the public API used in `useAuth.tsx` (`supabase.auth.mfa.challenge`, `verify`, `listFactors`, `getAuthenticatorAssuranceLevel`, `refreshSession`) is unchanged.

### 2. Harden the MFA challenge effect in `src/pages/Auth.tsx`

The `refreshChallenge` `useEffect` currently re-runs after a successful verification (because `MFA_CHALLENGE_VERIFIED` mutates session state and `showMFAChallenge` is briefly still `true`), which is what surfaces the red error toast even when the verify call has already succeeded.

Changes inside `Auth.tsx` only:

- Track whether a challenge has already been issued for the current `mfaFactorId` and skip re-creation if it has, instead of unconditionally calling `challengeMFA` every time the effect fires.
- Demote the user-facing toast to a single, debounced attempt: only show "Could not start verification" if the very first challenge attempt fails, and keep retries silent (logged to console).
- After a successful verify, clear `mfaChallengeId` and `mfaFactorId` before navigating, so the effect cannot re-enter.

### 3. Verify

After the dependency bump and effect cleanup:

- Sign in as the admin account → MFA prompt appears with no error toast.
- Enter a valid TOTP code → toast shows "MFA verified! Redirecting to admin..." and the user lands on `/admin` with AAL2.
- Confirm in the auth logs that the `403: invalid claim: missing sub claim` entries stop appearing for `/factors/.../challenge` and `/user`.

## Files touched

- `package.json` — bump `@supabase/supabase-js` to `^2.57.2`.
- `src/pages/Auth.tsx` — guard `refreshChallenge` effect against re-entry and silence the duplicate toast.

No database migrations, no edge function changes, no schema changes.
