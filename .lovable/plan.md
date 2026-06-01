## Goal

Make email + password login reliable across all mobile browsers (iOS Safari/Chrome, Android Chrome/Samsung Internet, etc.) and desktop. The login logic itself works; the failures come from how mobile keyboards mangle the typed email and from missing input hints.

## Root causes found

1. **Email gets capitalized / autocorrected on mobile.** The email `Input` (login, signup, and reset forms) only sets `type="email"`. Mobile keyboards then auto-capitalize the first letter, run autocorrect/spellcheck, and can append a trailing space — producing values like `"John@Gmail.com "` that fail with "Invalid login credentials".
2. **Email is never normalized before sign-in.** `handleLogin` passes the raw field value straight into `signIn`. Any stray whitespace or casing from the keyboard goes through untouched.
3. **No autofill / password-manager hints.** Missing `autoComplete` attributes mean iOS/Android and password managers don't reliably offer saved credentials, so users retype (and mistype) on small screens.
4. **iOS zoom-on-focus.** The shared `Input` uses a 14px font; iOS Safari zooms the page when focusing a sub-16px field, which feels broken on phones.

## Changes

### `src/pages/Auth.tsx`
- Add mobile-safe attributes to every email field (login, signup, reset):
  `inputMode="email"`, `autoComplete="email"`, `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`.
- Add `autoComplete="current-password"` to the login password field and `autoComplete="new-password"` to the signup password/confirm fields, so password managers fill the right field.
- Normalize the email at submit time in `handleLogin`, `handleSignup`, and `handleResetPassword`: `email.trim().toLowerCase()` before calling the auth function.

### `src/hooks/useAuth.tsx`
- Defensively normalize email inside `signIn`, `signUp`, `resetPassword`, and `resendConfirmationEmail` (`email.trim().toLowerCase()`) so the fix holds regardless of caller.

### `src/components/ui/input.tsx` (mobile zoom only)
- Bump the input font to 16px on small screens (e.g. `text-base md:text-sm`) so iOS Safari no longer zooms when a field is focused. This is a presentational tweak and affects inputs app-wide consistently.

## Verification

- Use the in-tool browser at mobile viewports (e.g. 390×844 iPhone, 360×800 Android) to load `/auth`, confirm the email field no longer auto-capitalizes and that login succeeds with surrounding spaces/mixed case.
- Confirm desktop login still works unchanged.

## Notes / out of scope

- This plan only touches email + password login per your answer. Google OAuth and admin MFA are left as-is.
- If logins still fail on a specific mobile browser after this, the next suspect is Supabase Auth **Redirect URLs / Site URL** config for the custom domains (shazamparking.ae, swiftlaces.com) — that's a dashboard setting, not code, and I'll flag it if needed.
