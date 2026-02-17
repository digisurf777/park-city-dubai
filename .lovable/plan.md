

# Fix Two-Step Verification Loop

## Root Cause

The entire MFA verification flow uses `(session as any)?.aal` to check the Authenticator Assurance Level, but this property does not exist on the Supabase JS SDK session object. It always returns `undefined`, which causes:

- AAL checks to never detect `'aal2'`, even after successful MFA verification
- The `waitForAAL2()` polling loops to always time out
- AdminPanel to always fail validation and redirect back to `/auth`
- `/auth` to re-trigger MFA challenge, creating an infinite loop

## The Fix

Replace all `(session as any)?.aal` calls with the correct Supabase API:

```text
supabase.auth.mfa.getAuthenticatorAssuranceLevel()
```

This returns `{ currentLevel: 'aal1' | 'aal2', nextLevel: ... }`.

## Files to Change

### 1. `src/pages/Auth.tsx` (line 228)

Replace:
```typescript
const currentAAL = (sessionData.session as any)?.aal;
```
With a call to `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` and use `currentLevel` from the result.

Also fix the `waitForAAL2` function (lines 322-331) in `handleMFAVerification` to use the correct API instead of polling `session.aal`.

### 2. `src/pages/AdminPanel.tsx` (lines 275-296)

Fix the `waitForAAL2` function and the initial AAL check (line 292) to use `getAuthenticatorAssuranceLevel()` instead of `(session as any)?.aal`.

### 3. `src/components/MFARequiredGuard.tsx` (line 65)

Replace:
```typescript
const clientAAL = (sessionData.session as any)?.aal;
```
With the correct `getAuthenticatorAssuranceLevel()` call.

### 4. `src/hooks/useAuth.tsx` (lines 372-376, 431-436)

Fix the `waitForAAL2` polling loops inside `verifyMFA` and `verifyMFAChallenge` to use `getAuthenticatorAssuranceLevel()` instead of `(session as any)?.aal`.

## Summary of Pattern

Every instance of this broken pattern:
```typescript
const { data: s } = await supabase.auth.getSession();
const aal = (s.session as any)?.aal;
```

Will be replaced with:
```typescript
const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
const aal = aalData?.currentLevel;
```

This is a 4-file fix that corrects the same underlying bug in all locations where AAL is checked.

