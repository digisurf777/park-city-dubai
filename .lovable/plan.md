
# Cosmic Revenue Command Center — Plan

A new premium **Revenue** sub-dashboard inside the admin panel that visualizes how money flows through the platform: bookings → revenue → owner payouts → platform margin. Designed as a single, breathtaking page (Jarvis / SpaceX vibe — deep space gradients, neon glow, glassmorphism, animated counters, particle flows).

## What you'll see on the page

```text
┌─────────────────────────────────────────────────────────────┐
│  ✦ REVENUE COMMAND CENTER          [ 7d │ 30d │ 90d │ All ] │
│  Live • Last sync 2s ago                                    │
└─────────────────────────────────────────────────────────────┘

┌───────────┬───────────┬───────────┬───────────┐
│ TOTAL REV │ THIS MONTH│ PLATFORM  │ PAYOUTS   │
│ 109,954   │ +24,300   │ MARGIN    │ 24,567    │
│ AED ↑42%  │ ✦ pulse   │ 22.3%     │ to owners │
│ [sparkline]│[sparkline]│ [ring gauge]│[sparkline]│
└───────────┴───────────┴───────────┴───────────┘
        ↑ animated count-up + neon glow on hover

┌─────────────────────────────┬───────────────────────────────┐
│ REVENUE FLOW (last 30 days) │  MONEY FLOW DIAGRAM           │
│  ╱╲    ╱╲ area gradient     │  Bookings ──┐                 │
│ ╱  ╲  ╱  ╲  with neon glow  │             ├→ Revenue        │
│ ─────────────                │  Pre-auth ──┘    ├→ Payouts   │
│ Bookings vs Revenue          │                  └→ Platform  │
└─────────────────────────────┴───────────────────────────────┘

┌─────────────────────────┬───────────────────────────────────┐
│ TOP ZONES (radar)       │  LIVE PULSE (real-time activity)  │
│  Marina  ●●●●●          │  ● 2s ago — 1,200 AED captured    │
│  JBR     ●●●●           │  ● 14s ago — Pre-auth held        │
│  Downtown●●●            │  ● 1m ago — Payout 580 AED        │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PAYMENT STATUS BREAKDOWN (donut + animated legend)         │
│  Paid 1 · Pre-authorized 19 · Pending 9 · Cancelled 21      │
└─────────────────────────────────────────────────────────────┘
```

## Visual direction

- **Deep space backdrop** — radial gradients in `--primary-deep` → black, subtle starfield (CSS dot pattern) and floating gradient orbs
- **Neon glassmorphism** — frosted cards with primary/cyan glow rings, intense shadow on hover
- **Animated count-up** — KPIs animate from 0 → value on mount (framer-motion `useSpring`)
- **Neon area charts** — recharts `<AreaChart>` with gradient fill + drop-shadow glow filter
- **Money-flow diagram** — custom SVG with animated dashed paths (CSS `stroke-dashoffset` keyframes) so money visibly "flows" from Bookings → Revenue → Payouts → Platform
- **Real-time pulse feed** — Supabase realtime subscription on `parking_bookings` and `owner_payments`; new events slide in with `animate-fade-in`
- **Period selector** — sleek segmented control (7d / 30d / 90d / All) that re-queries
- All colors via existing semantic tokens (`--primary`, `--primary-glow`, `--primary-deep`) — no hardcoded hex

## Data sources (already in DB)

- `parking_bookings` — `cost_aed`, `payment_status`, `status`, `zone`, `created_at`, `start_time`
- `owner_payments` — `amount_aed`, `payment_date`, `owner_id`
- Derived KPIs:
  - **Gross revenue** = SUM of confirmed/captured bookings
  - **Platform margin** = Gross revenue − SUM(owner_payments) for same period
  - **Active holds** = count + sum of `pre_authorized`
  - **Top zones** = GROUP BY zone

## Files

- **NEW** `src/components/admin/RevenueCommandCenter.tsx` — the whole dashboard component
- **NEW** `src/components/admin/MoneyFlowDiagram.tsx` — animated SVG flow
- **NEW** `src/components/admin/AnimatedCounter.tsx` — count-up hook/component
- **EDIT** `src/pages/AdminPanel.tsx` — add a new tab `revenue` between Pre-Auth and Payments, wire the component
- **EDIT** `src/index.css` — add a few keyframes (`flow-dash`, `cosmic-pulse`) and a starfield utility class

## Technical notes

- Charts: **recharts** (already installed) with custom `<defs>` gradients + SVG filters for neon glow
- Animations: **framer-motion** (already installed); no three.js to keep bundle lean and load fast
- Realtime: Supabase channel on `parking_bookings` + `owner_payments` postgres_changes
- Data queries are read-only client-side (admin RLS already enforces access)
- Mobile: KPI grid collapses to 2 cols, charts stack vertically, money-flow diagram switches to vertical orientation
- Period switches refetch in <300ms; loading skeletons match card shapes

## Out of scope (kept minimal)

- No new edge functions
- No DB migrations
- No three.js / WebGPU (would add 500KB+ and risk preview crashes); the "3D feel" comes from gradients, glow, depth shadows and motion
- Existing PaymentHistoryAdmin tab stays untouched (it's the operational view); Revenue Center is the executive view

After your approval I'll build it in one pass.
