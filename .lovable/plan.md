# Boss Admin Dashboard — live, real data, profesjonalny

Nowy "Dashboard" jako pierwsza zakładka panelu admina. Wszystko liczone z aktualnych danych Supabase, z live refresh (Realtime + 60s fallback). Reszta istniejącego panelu zostaje bez zmian.

## Co zobaczysz (na podstawie obecnych danych w bazie)

Wstępne metryki w Twoim systemie już teraz:
- 374 użytkowników (27 nowych w 30 dni)
- 68 listingów (67 aktywnych)
- 29 bookings (8 confirmed, 19 pre-authorized, 21 cancelled)
- GMV (confirmed) ~44,538 AED · Wypłaty ownerom 24,567 AED · Net margin ~19,971 AED

## Layout dashboardu

```text
┌─────────────────────────────────────────────────────────────┐
│  Boss Dashboard            [7d] [30d] [90d]   ⟳ live · 12s  │
├─────────────────────────────────────────────────────────────┤
│ KPI ROW 1 (4 karty z trendem)                               │
│ ┌──────────┬──────────┬──────────┬──────────┐               │
│ │ GMV      │ Net Rev  │ Payouts  │ Bookings │               │
│ │ 44,538 د │ 19,971 د │ 24,567 د │   29     │               │
│ │ +12% ↑30 │  …       │  …       │  …       │               │
│ └──────────┴──────────┴──────────┴──────────┘               │
│ KPI ROW 2 (4 karty)                                         │
│ │ Users 374 │ Paying 23 │ Free 351 │ Conv 2.1% │            │
├─────────────────────────────────────────────────────────────┤
│  Revenue & Bookings trend (area + bars)  │  New users line  │
│  ───────────────────────────────         │  ────────────    │
├─────────────────────────────────────────────────────────────┤
│  Top zones (revenue + listings)   │  Top earning owners      │
│  Marina  ████████ 18,500          │  1. A.Khan  12,300 AED   │
│  Bay     ████  6,200              │  2. M.Ali    8,500 AED   │
├─────────────────────────────────────────────────────────────┤
│  Live activity feed       │  Quick actions / inbox alerts   │
│  • Booking · Marina 1,100 │  [📣 Broadcast to all users]   │
│  • New user · john@…      │  [📨 Message a user]           │
│  • Payout · A.Khan 3,200  │  3 unread · 4 pending KYC      │
└─────────────────────────────────────────────────────────────┘
```

## Sekcje i metryki

### KPI cards (8) — wszystkie z prawdziwych danych
- **GMV (paid/confirmed)** + delta vs poprzednie 30 dni
- **Net revenue** = GMV − payouts ownerom (przybliżona marża)
- **Owner payouts** total + last 30d
- **Bookings** total / paid / pre-auth / pending / cancelled (badge breakdown)
- **Users** total · new 30d · new 7d
- **Paying owners** vs **Free users** (segmentacja)
- **Conversion rate** (% userów z ≥1 paid booking)
- **Pending KYC** + **Unread messages** (CTA do odpowiednich tabów)

### Wykresy (recharts, już w projekcie)
- **Revenue area + bookings bars** combo, ostatnie 7/30/90 dni (przełącznik)
- **New users line chart** w tym samym oknie czasu
- **Zone breakdown** — bar chart z revenue per zone + listings count

### Top owners leaderboard
Top 8 ownerów posortowane po `total_earned`. Kolumny: avatar/imię, email, listings count, payouts count, total earned. Klik → otwiera istniejący tab "Payments" / "Users".

### Live activity feed
Ostatnie 12 zdarzeń: bookings, nowi użytkownicy, payouts. Status badge + kwota AED + relative time ("2 min ago"). Auto-update przez Realtime.

### Quick actions (boss controls)
- **📣 Broadcast** — modal wysyła `user_messages` do wszystkich userów (z subjectem + treścią). Z confirm dialogiem ("Wyślesz do 374 osób, kontynuować?").
- **📨 Message a user** — combobox z listą profili (wyszukiwanie po nazwie/emailu) → szybki form do napisania wiadomości jednej osobie. Insert do `user_messages` z `from_admin=true`.
- **Jump to** — szybkie skróty do tabów: Pre-auth, Owner payments, KYC, Chats.

## Technika

### Nowe pliki
- `src/hooks/useAdminStats.tsx` — fetch z `profiles`, `parking_listings`, `parking_bookings`, `owner_payments`, `user_verifications`, `user_messages`. Liczenie KPI / trendu / zones / top owners / recent. Subskrypcja Realtime na 4 tabele + fallback `setInterval(60000)`. Eksportuje `{ data, loading, refreshing, lastUpdated, refetch }` z range `7|30|90`.
- `src/components/admin/AdminDashboard.tsx` — UI dashboardu (KPI cards, recharts AreaChart/BarChart/LineChart, leaderboard, feed, quick action modale).
- `src/components/admin/BroadcastDialog.tsx` — modal "Broadcast to all users" (subject, message, confirm count, batch insert do `user_messages`).
- `src/components/admin/MessageUserDialog.tsx` — modal "Message a user" (Command/Combobox z `profiles`, subject + message, insert do `user_messages`).

### Edycje
- `src/pages/AdminPanel.tsx` — dodać `<TabsTrigger value="dashboard">` jako PIERWSZĄ zakładkę z ikoną LayoutDashboard, ustawić `defaultValue="dashboard"`. Render `<AdminDashboard />` w nowym `<TabsContent>`.

### Bezpieczeństwo / zgodność z politykami
- Wszystkie zapytania używają `supabase` clienta — RLS sam ograniczy dane do admin (już są policy "admins_full_access_*").
- Broadcast & message wpisują wiersze do `user_messages` z `from_admin=true` — istniejąca polityka admina pokrywa insert (admin ma `ALL`).
- Bez nowych migracji, bez nowych edge functions. Bez serwisowych kluczy, bez SQL stringów — tylko typed client.
- Phone/email displayed tylko adminowi (już jest na MFA).

### Mobile
- KPI grid: 2 cols mobile / 4 desktop.
- Wykresy `ResponsiveContainer` 100%.
- Leaderboard i feed: jednokolumnowe na mobile, dwukolumnowe ≥lg.
- Sticky range-picker nad KPI.

### Brand / styl
- Karty z `glass-card` + `shadow-elegant`, gradient akcent `bg-gradient-primary` na "GMV" i "Net Rev".
- Wykresy w teal palette: `hsl(var(--primary))`, `hsl(var(--primary-glow))`, `hsl(var(--primary-deep))`.
- Status badge (paid=zielony, pending=żółty, cancelled=czerwony, pre_auth=niebieski).

## Co NIE jest w tym kroku
- Eksport CSV / PDF KPI (mogę dodać w kolejnym kroku jeśli chcesz).
- Cohort analysis / retencja (wymaga więcej danych historycznych).
- Edge function do pre-aggregacji (póki <1000 wierszy w tabelach — niepotrzebne, fetch jest szybki).