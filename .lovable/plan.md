
# Admin Panel Upgrade — Banner, KYC Preview, Support Desk, Booking Analytics

Four focused improvements to `/admin`. All data already exists in the DB — we only refine UI and wire a few new queries.

## 1. Premium "Dubai" Dashboard Banner

Replace the current header strip in `AdminDashboard.tsx` with a tall hero banner:

- Background: layered Dubai skyline silhouette (Burj Khalifa + Marina) as an SVG line-art layer over a deep gradient (`--primary-deep` → `--primary` → black), plus a soft golden "desert" glow at the bottom and animated star/particle dots.
- Frosted glass info row on top: "Boss Dashboard" title with crown icon, live status dot, last sync time, currency switcher, range selector (7/30/90d) and refresh button — all in a single pill-shaped glass bar with stronger 1px white/10 borders for the contrast the user asked for.
- Adds 3 quick KPIs inline (GMV today, bookings today, pending actions count) so the banner is informative, not just decorative.
- Stronger borders/contrast applied globally to KPI cards and chart cards: bumped from `border-primary/15` → `border-primary/30`, added 1px inner highlight, slightly darker shadows.

```text
┌──────────────────────────────────────────────────────────┐
│  ✦ stars      ▲   ▲▲▲                                    │
│         ▲▲▲ ▲▲▲▲▲▲▲▲▲ ▲   Dubai skyline silhouette       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│  👑 Boss Dashboard   • Live · synced 3s ago              │
│  Today: 12 bookings · 4,320 AED · 2 pending KYC          │
│  [ 7d │ 30d │ 90d ]  [AED ▼]  [↻]                        │
└──────────────────────────────────────────────────────────┘
```

## 2. User Verification — Inline Document Preview + Quick Actions + Direct Message

Rework the verification card in `AdminPanel.tsx` (Users → Verifications tab):

- **Inline preview**: instead of "Quick View" loading separately, the document image is shown immediately in a 320x220 thumbnail on the right side of every card, lazy-loaded via the existing `generate-secure-document-token` flow. Click thumbnail → opens existing full-size dialog with zoom.
- Thumbnail has Approve/Reject overlay buttons on hover for one-click action.
- **Reject with reason**: clicking Reject opens a small dialog asking for a reason (textarea, 3 quick presets: "Document blurry", "ID expired", "Name mismatch"). Reason is sent to the user via the existing email function and saved as an admin note in `user_messages`.
- **Message user button** added to every verification card — opens the existing `MessageUserDialog` pre-filled with the user.
- Status badges get clearer colors (amber pending / emerald verified / rose rejected) and a "Submitted X days ago" relative time chip.

## 3. Support Desk Upgrade

Refine `SupportDashboard.tsx`:

- Add a per-conversation **status pill**: `New` (red), `Awaiting reply` (amber), `Replied` (green), `Closed` (gray). Status is computed from message order: if last message is from user → `Awaiting reply`; if from admin → `Replied`; never read by admin → `New`.
- New filter tabs at top: `Needs reply` (default) · `Awaiting user` · `All` · `Feedback` · `Handoff`. Counts shown on each tab.
- "Mark as actioned" button on each conversation that flips `read_status=true` for all admin-side messages so the row drops out of `Needs reply`.
- SLA timer chip per conversation: "Waiting 2h 14m" — turns red after 4h.
- Stat cards row gets a 5th card: **Needs reply** (big red number) so the admin sees workload at a glance.
- Conversation list shows a colored left border matching the status pill for instant scanning.

## 4. Booking Analytics — More Charts on the Dashboard

Add a new section under the existing Revenue & Bookings chart in `AdminDashboard.tsx`:

- **Bookings funnel** (horizontal bar): Pending → Pre-authorized → Paid → Completed → Cancelled, with counts and conversion % between stages.
- **Bookings by zone** (donut): top 6 zones by booking count for selected range, with legend on the right.
- **Hourly heatmap** (7×24 grid): when bookings are created, intensity from primary-glow → primary-deep — shows peak hours/days.
- **Recent bookings strip**: last 8 bookings as compact cards (name, zone, status pill, amount, time ago) with one-click jump to the booking in the bookings tab.
- All charts pull from the same `useAdminStats` hook; we extend it with `funnel`, `zoneDonut`, `hourlyHeatmap`, `recentBookings` arrays computed in one pass.
- Loading skeletons for each chart; empty states when no data.

## Technical Notes

- Files edited:
  - `src/components/admin/AdminDashboard.tsx` — new banner + analytics section + stronger borders
  - `src/hooks/useAdminStats.tsx` — add funnel / donut / heatmap / recent computations
  - `src/pages/AdminPanel.tsx` — verification card layout + reject-reason dialog + Message button wiring
  - `src/components/admin/SupportDashboard.tsx` — status pill, filters, SLA timer, mark-actioned
  - `src/components/SecureDocumentViewer.tsx` — expose a thumbnail variant that auto-loads the secure URL
- New file: `src/components/admin/DubaiSkylineBanner.tsx` — SVG skyline + particles, reused only in dashboard.
- No DB migrations. No new edge functions. Existing `MessageUserDialog`, `send-verification-approval`, `send-user-reply-notification` are reused.
- All colors via design tokens (`--primary`, `--primary-glow`, `--primary-deep`, semantic emerald/amber/rose). No hardcoded hex.
- Mobile: banner collapses to a shorter version; charts stack 1-column; verification thumbnail moves above the actions.

After approval I will implement everything in one pass.
