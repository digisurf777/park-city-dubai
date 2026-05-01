
# Landing Page UI Refresh

Goal: a more modern, cohesive look across the landing page using the new brand color **#31B2A0**, with rounded "3D" buttons, framed images with a subtle animation, a restyled "Own a Parking Space" CTA banner, and a polished footer.

## 1. Brand color update (global)

File: `src/index.css`
- Change `--primary` from `174 66% 56%` (#4ECDC4) to `174 57% 44%` (#31B2A0) in both `:root` and `.dark`.
- Update `--ring` and `--sidebar-primary` to match.
- This automatically recolors every `bg-primary`, `text-primary`, `hover:bg-primary/90` across the app — no per-component color swaps needed.

## 2. Rounded 3D button style (global)

File: `src/components/ui/button.tsx`
- Default variant becomes more rounded and gets a soft 3D effect:
  - Base classes: `rounded-full` (instead of `rounded-md`), `shadow-[0_4px_0_0_hsl(var(--primary)/0.35),0_8px_20px_-6px_hsl(var(--primary)/0.45)]`, `hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_hsl(var(--primary)/0.4),0_12px_24px_-6px_hsl(var(--primary)/0.55)]`, `active:translate-y-0.5 active:shadow-[0_2px_0_0_hsl(var(--primary)/0.3)]`, `transition-all duration-200`.
  - Add `transition-colors` → `transition-all` to support transform.
- `lg` and `sm` sizes also become `rounded-full`.
- Outcome: every button on the site (and there are many `<Button className="bg-primary ...">` usages on the landing page) gets the new look without editing each call site.

## 3. Landing page image polish

File: `src/pages/Index.tsx`
- **Popular Locations cards** (~line 180): change `Card` to `rounded-2xl ring-1 ring-primary/10 shadow-lg hover:shadow-2xl hover:ring-primary/30`, keep the existing zoom-on-hover. Add a subtle floating animation via `whileHover={{ y: -8 }}` (already similar) and a soft gradient overlay on hover.
- **"Rent out your space" image** (luxuryCar, ~line 399): wrap in a framed container — `rounded-2xl ring-1 ring-primary/20 shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.4)] p-1 bg-gradient-to-br from-primary/10 to-transparent`, image inside `rounded-xl`. Add a gentle continuous float animation (`animate-[float_6s_ease-in-out_infinite]`).
- **"Find Parking" image** (dubaihero, ~line 414): same framing treatment.
- **Businessman image** (~line 456): same framing treatment, slightly tighter ring.
- Add a `float` keyframe to `src/index.css` (`0%,100% { translateY(0) } 50% { translateY(-8px) }`).

## 4. "Own a Parking Space" CTA banner

File: `src/pages/Index.tsx` (~lines 503–619)
- Replace flat `bg-primary` with a richer brand-tinted background:
  - `bg-gradient-to-br from-[hsl(174_57%_38%)] via-primary to-[hsl(174_60%_50%)]`.
  - Add decorative blurred blobs (`absolute w-72 h-72 rounded-full bg-white/10 blur-3xl`) for depth.
  - Add a subtle dotted/grid overlay using a CSS radial-gradient for texture.
- Headline gradient: switch the yellow gradient on "Turn it into a steady passive income." to a clean white with subtle drop-shadow, so it stays on-brand (currently mismatched yellow/slate).
- CTA button: keep white background, primary text, but use new rounded-3D button style automatically.
- Trust indicator checkmarks: change yellow `✓` to a small white circular badge with primary check icon for cleaner brand alignment.

## 5. Footer polish

File: `src/components/Footer.tsx`
- Background: switch from flat `bg-gray-900` to `bg-gradient-to-b from-gray-900 to-[hsl(174_30%_8%)]` for a subtle brand tint.
- Add a thin top accent bar: `<div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />`.
- Section headings: add small primary underline accent (`after:` pseudo via inline span, or `border-b-2 border-primary/40 inline-block pb-1`).
- Quick Links / Support items: add `hover:translate-x-1 transition-transform` along with existing color hover for a nicer micro-interaction.
- Contact email row: wrap in a small rounded chip `inline-flex bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10`.
- App store buttons: tighten styling — `rounded-xl`, `hover:bg-white/5 transition-colors`, keep "Coming Soon" label.
- Bottom bar: add `border-primary/20` instead of `border-gray-800` for a subtle brand line; update copyright year to 2026.

## Out of scope
- No copy changes besides the bottom-bar year.
- No structural/section reordering.
- No changes to other pages (the global color + button refresh will, however, propagate across the whole app — this is intentional).

## Technical notes
- All color changes flow through CSS variables; no hard-coded hex values added in components.
- New keyframe `float` added once in `src/index.css`.
- Button shadow uses `hsl(var(--primary)/X)` so the 3D depth automatically follows the brand color.
- Respects existing `prefers-reduced-motion` block (animation will be disabled there).
