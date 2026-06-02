## Goal
Fix two issues: (1) the admin customer‑service chat is painful on mobile because the reply box sits below the whole conversation, and (2) both personal and admin accounts keep getting logged out.

---

## Issue 1 — Admin chat is hard to use on mobile

**What happens today** (`src/components/admin/SupportDashboard.tsx`): on mobile the layout collapses to one column — the conversation list, then the message thread, then the reply box stacked underneath. To reply you must scroll past the entire conversation to reach the composer. The messages area uses a fixed `max-h-[380px]` and the composer is just a normal block below it, so it scrolls with the page.

**Fix — mobile‑first focused thread view (desktop layout unchanged):**
- When a conversation is selected on mobile, show a focused, near‑full‑height thread panel instead of stacking everything:
  - A compact sticky header with a "← Conversations" back button (returns to the list).
  - A messages area that scrolls **internally** (its own scroll region, fills available height) — not the whole page.
  - The reply composer **pinned to the bottom** of that panel (sticky), always visible, so the admin can read and reply without scrolling to the end.
- Auto‑scroll the messages area to the newest message when a conversation opens and after sending a reply.
- Keep the existing AI‑draft button and send button in the pinned composer.
- On desktop (`lg` and up) keep the current two‑column list + thread layout exactly as it is.

This makes replying on mobile a "WhatsApp‑style" experience: header on top, messages in the middle, input always at the bottom.

---

## Issue 2 — Users keep getting logged out

**Primary cause (server‑side):** the Supabase Auth logs show the token‑refresh endpoint failing:
```
POST /token  grant_type=refresh_token  →  500
"missing destination name oauth_client_id in *models.Session"
```
This is a Supabase Auth (GoTrue) platform/schema issue: when the session token can't be refreshed, the session can't be renewed and the user is forced to log in again. This affects both personal and admin accounts and matches "logged out multiple times today." This part is fixed by upgrading the project's Supabase Auth (GoTrue) version, not by app code — I'll flag this and recommend the upgrade in the Supabase dashboard. I'll verify current refresh behavior after the client hardening below.

**Client‑side hardening I will do:**
- Make session persistence explicit and robust in `src/integrations/supabase/client.ts` (explicit `storageKey`, `storage: localStorage`, `flowType: 'pkce'`, keep `persistSession`/`autoRefreshToken`), so a refreshed/restored session is reliably restored on revisit.
- Remove the auth‑cache‑clearing footguns that can wipe tokens:
  - `src/components/EnhancedServiceWorker.tsx` — the `beforeunload` handler that posts `CLEAR_AUTH_CACHE` (dead/harmful pattern).
  - Neutralize `clearAuthCache`/`no-store` helpers in `src/utils/cacheUtils.ts` that strip `sb-*` / `supabase.auth.*` keys, so they can't accidentally clear the session.
- Handle a failed token refresh gracefully in `src/hooks/useAuth.tsx` (treat transient `TOKEN_REFRESHED` failures without immediately dumping the user to `/auth`), so a one‑off server hiccup doesn't end the session.

Note: admins are intentionally re‑challenged for MFA when a session is at AAL1 — that is by design and will be left in place. The goal here is to stop *unintended* logouts.

---

## Technical details / files touched
- `src/components/admin/SupportDashboard.tsx` — responsive thread/composer restructure, internal scroll region, sticky composer, auto‑scroll-to-bottom, mobile back button.
- `src/integrations/supabase/client.ts` — explicit, robust auth storage config.
- `src/components/EnhancedServiceWorker.tsx` — remove `beforeunload` auth‑cache clearing.
- `src/utils/cacheUtils.ts` — stop clearing Supabase auth keys / no‑store meta.
- `src/hooks/useAuth.tsx` — resilient handling of refresh/sign‑out events.

## Verification
- Mobile viewport (≈390px): open Admin → Support Inbox, select a conversation, confirm composer is visible without scrolling, messages scroll internally, and sending scrolls to newest.
- Desktop: confirm the two‑column layout is unchanged.
- Auth: reload and re‑enter the site to confirm the session persists; watch for refresh‑token errors. If the GoTrue 500 persists, recommend the Supabase Auth upgrade.