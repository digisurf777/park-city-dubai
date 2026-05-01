## Goals

1. **Support chat** that already knows everything about the logged-in user (profile, bookings, listings, payouts, verification) before it answers, replies like a human, and resolves most issues itself.
2. **Bigger, prettier chat window** with smooth expand/collapse, a polished launcher button, branded avatar, and proper history.
3. **Admin Live Chat** gets a "Generate draft reply" button — AI drafts a personalised response using the same user context, admin can edit & send.
4. **Admin dashboard** gets richer visualisations and a couple of new high-signal panels.

---

## 1. Knowledge base for the AI

Most facts the bot needs already live in the DB (bookings, listings, payouts, verification, profile, MFA). We add **one new table** for editable platform knowledge (FAQs, policies, how-to articles) so support answers stay in sync without redeploys.

```text
platform_knowledge
─ id uuid pk
─ category text         (booking | payment | listing | account | policy | general)
─ title text
─ content text          (markdown — the actual answer)
─ keywords text[]       (helps retrieval)
─ priority int default 0
─ is_active bool default true
─ created_at, updated_at
```

RLS: public can `SELECT` active rows; only admins can write. Seeded with ~20 entries covering: how bookings work, refund policy (final & non-refundable), 500 AED access-card deposit, payout schedule, listing approval flow, MFA, contact info, etc. Editable from Admin → "Knowledge Base" sub-tab.

## 2. AI edge function: `support-chat`

New function streams responses from Lovable AI Gateway (`google/gemini-2.5-flash`, `LOVABLE_API_KEY` already set).

On each request the function:
1. Validates JWT, gets `user.id`.
2. Loads **user context bundle** server-side:
   - profile (name, email, phone, user_type, created_at)
   - active + recent bookings (status, dates, location, amount, payment_status)
   - listings owned (status, zone, address)
   - latest owner payouts
   - verification status / MFA
   - unread admin notifications
3. Pulls top relevant `platform_knowledge` rows (keyword match on the user's last message).
4. Builds a strict system prompt: human, warm, concise, never invents facts, refers to bookings by date/location, escalates to human when unsure ("I'll flag this for our team").
5. Streams the assistant reply (SSE) back to the widget.
6. Persists both user message and assistant reply into `user_messages` (assistant marked `from_admin = true`, with new flag `is_ai = true`) so admin sees the full thread.

Schema tweak: `ALTER TABLE user_messages ADD COLUMN is_ai bool DEFAULT false`.

## 3. Redesigned ChatWidget

File: `src/components/ChatWidget.tsx` — full rewrite.

- **Launcher button**: floating gradient pill ("Chat with us"), gentle pulse, online dot, unread badge. Mobile = compact circle.
- **Window sizes**: 3 states — minimized header bar, default (`w-[380px] h-[560px]`), expanded (`w-[560px] h-[80vh]` with side-fade animation). Toggle via maximize icon.
- **Header**: AI avatar (generated image — friendly support agent, no text), name "Layla – Shazam Assistant", green online dot, expand / minimize / close icons.
- **Messages**: bubble layout with markdown rendering (`react-markdown`), typing indicator (animated dots) while streaming, timestamps, distinct AI vs human-admin styling.
- **Composer**: auto-grow textarea, Enter to send / Shift+Enter newline, attachment-style quick suggestions (chips) on first open ("My booking", "Payments", "List my space", "Talk to a human").
- **Streaming**: reads SSE chunks from `support-chat` and appends to the in-flight assistant bubble.
- **History**: full thread loaded from `user_messages`, realtime subscription for admin replies.
- **"Talk to a human"** chip flips a flag — bot stops auto-replying and admin gets a high-priority notification.

Image to generate (no text on it): `src/assets/support-avatar.webp` — friendly Middle-East-style support agent portrait, soft brand-green backdrop.

## 4. Admin Live Chat upgrades

File: `src/pages/AdminPanel.tsx` (chat tab) — keep current 3-column layout, add:

- **Right-side User Context panel** (replaces empty space when a conversation is selected): profile card, latest bookings list, listings, payouts total, verification status, unread alerts. One click → jump to that booking/listing in admin.
- **"Generate draft" button** above the reply input. Calls `support-chat` with `mode: "draft"` and the conversation history; returned text is placed (editable) in the reply textarea. Admin tweaks → sends.
- **Quick canned replies** dropdown (pulled from `platform_knowledge`) for one-click insertion.
- **AI badge** on messages where `is_ai = true` so admin can tell apart bot vs human-admin replies.
- **Search & filter** on the conversations list (by name/email, only-unread toggle).

## 5. Admin Dashboard upgrades

File: `src/components/admin/AdminDashboard.tsx` + `useAdminStats.tsx`.

Add:
- **Funnel card**: Visitors → Signups → Verified → First booking → Repeat (uses existing tables; visitors = signups for now).
- **Revenue split donut**: GMV vs payouts vs net.
- **Booking status mix** stacked bar over time.
- **Occupancy heatmap** (zone × weekday) from `parking_bookings`.
- **AI support stats** small KPI: chats today, resolved-by-AI %, avg reply time, escalations.
- **Sticky live activity** ticker with subtle slide-in for new rows (realtime channel on bookings + user_messages + parking_listings).
- Polished tooltips and empty-state illustrations.

## 6. Memory rule

Save: AI support agent persona is "Layla", powered by `google/gemini-2.5-flash` via Lovable AI Gateway, must always load full user context before replying, never invent facts, escalate when unsure.

---

## Technical notes

- New table `platform_knowledge` + new column `user_messages.is_ai` via migration tool.
- New edge function `supabase/functions/support-chat/index.ts` (streaming, JWT-validated, CORS).
- Frontend deps: add `react-markdown` (already common). Streaming via `fetch` + `ReadableStream`.
- All colors via existing semantic tokens (`primary`, `primary-glow`, `muted`, etc.) — no hard-coded hex.
- Mobile: chat window adapts to `inset-0` with safe-area padding when expanded on small screens.
- Rate limit safety: client debounces sends; edge function returns 429-friendly errors.
- No service-role key on the client; widget calls the edge function with the user's JWT.

## Out of scope (ask if you want them)

- Voice input / file uploads in chat.
- Multilingual auto-detect (currently English; can add Arabic toggle later).
- Per-conversation AI on/off toggle from the widget (admin can disable globally).