## Problem

Two issues on `/admin`:

1. The **Boss Dashboard hero banner** is slightly clipped at the top because the global `Navbar` is `fixed top-0` with height `h-16` (64px), but `src/pages/AdminPanel.tsx` wraps content in `p-3 sm:p-6` with no top offset for the fixed bar. Every other page (Index, AboutUs, etc.) adds its own `pt-16`/`pt-20`. The admin page is missing this.
2. The hero currently only shows the gold **Crown** icon next to the "Boss Dashboard" title. The user wants a richer Dubai-flavored visual — a "boss from Dubai" character — inside the banner.

## Plan

### 1. Push the boss dashboard down so the navbar no longer covers it

In `src/pages/AdminPanel.tsx` (line ~1789), update the page wrapper to add top padding equal to the fixed navbar height (plus a small breathing buffer):

- Change `p-3 sm:p-6` → `px-3 sm:px-6 pb-3 sm:pb-6 pt-20 sm:pt-24`

This gives the hero banner clean space below the glass navbar on every breakpoint, matching the spacing used elsewhere on the site.

### 2. Generate a "Dubai boss" character illustration

Use the AI image generation gateway (`google/gemini-3.1-flash-image-preview` — Nano banana 2, fast + high quality) to produce a single hero portrait:

- Prompt direction: a confident, friendly Emirati businessman in a crisp white kandura and ghutra, soft smile, premium executive vibe, Dubai skyline (Burj Khalifa, Business Bay) softly blurred in the background at golden hour, cinematic lighting, transparent or soft gradient backdrop, square framing, professional editorial illustration style, no text.
- Save the output to `src/assets/boss-dubai-character.webp` (or `.png` if alpha is needed).

### 3. Place the character inside the existing `DubaiSkylineBanner`

Edit `src/components/admin/AdminDashboard.tsx`, the `banner` JSX (around lines 90–130):

- Add a right-side decorative portrait that sits inside the banner without competing with the title:
  - On `sm+`: absolutely positioned on the right edge of the banner, ~h-44 to h-56, with `object-contain object-bottom`, slight drop-shadow, `pointer-events-none`, `select-none`, `aria-hidden`.
  - On mobile: hidden (`hidden sm:block`) so the title and refresh button stay readable.
- Increase the banner's right padding on `sm+` (e.g. `sm:pr-56`) so text never overlaps the portrait.
- Keep the gold Crown badge next to the "Boss Dashboard" title — it acts as the small icon the user also asked for; the portrait is the bigger statement piece.

### 4. Optional polish

- Add a soft radial highlight behind the portrait (tinted gold) so it blends with the existing skyline gradient already in `DubaiSkylineBanner`.
- Ensure the image uses `loading="lazy"` and `decoding="async"` for performance (consistent with the existing skyline `<img>` in `DubaiSkylineBanner.tsx`).

## Technical details

Files touched:

- `src/pages/AdminPanel.tsx` — wrapper padding only (1 line).
- `src/components/admin/AdminDashboard.tsx` — import the new asset, render the `<img>` inside the banner, adjust right padding.
- `src/assets/boss-dubai-character.webp` — new generated image asset.

Layout sketch of the updated hero:

```text
┌──────────────────────────────────────────────────────────────┐
│ [👑] Boss Dashboard                                          │
│      ● Live · synced 4s ago · Dubai, UAE        [⟳][AED][⎋] │
│                                              ╔═════════════╗ │
│                                              ║   Dubai     ║ │
│                                              ║   Boss      ║ │
│                                              ║  portrait   ║ │
│                                              ╚═════════════╝ │
└──────────────────────────────────────────────────────────────┘
```

No KPI/chart logic, routing, or data layer is touched — purely visual.
