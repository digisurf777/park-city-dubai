## Cel

Top Navigation Bar (desktop) wygląda obecnie płasko: linki to czysty `text-gray-700 hover:text-primary` bez tła ani podkreślenia, a guziki **My Account / Login / Logout** używają domyślnych wariantów `ghost`/`outline` — szare, bez zielonych akcentów, nie pasują do reszty platformy. Dopracowujemy styl, kolorystykę, hover/active states oraz wyróżnienie aktywnej strony.

## Zakres

Tylko `src/components/Navbar.tsx` — sekcja desktop (mobile drawer już ładnie wygląda i zostaje bez zmian).

## Zmiany

### 1. Linki w głównym pasku (Find a Parking Space, Zones, About Us, FAQ, News, Calculator)

- Wprowadzam pomocniczą funkcję `isActive(path)` z `useLocation()`.
- Każdy link dostaje wspólny wzorzec stylu:
  - Padding `px-3 py-2`, `rounded-lg`, `font-semibold text-sm`.
  - Hover: subtelny gradient `from-primary/8 to-primary-glow/8` + `text-primary`.
  - **Aktywna strona**: tło `bg-gradient-to-r from-primary/15 to-primary-glow/15`, `text-primary-deep`, `ring-1 ring-primary/20`, plus mała kropka-wskaźnik pod linkiem (zielony pasek 2px szerokości, `bg-primary` z glow).
  - Hover dodatkowo: lekka translacja `-translate-y-0.5` + transition dla efektu 3D.
- Ujednolicam Zones dropdown trigger — ten sam wzorzec aktywny/hover.

### 2. Guziki autoryzacyjne (zalogowany)

**My Account** — zamiast szarego ghost button zrobimy premium "profile pill":
```
[avatar circle gradient] My Account ▾
```
- Pigułka z `bg-white`, `ring-1 ring-primary/25`, hover `ring-primary/50` + cień `shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.35)]`.
- Mała kółkowa ikona `User` z gradientem `from-primary to-primary-glow`, biała ikona — pasuje do pigułek na landing.
- `text-primary-deep font-semibold`.
- Aktywne (na `/my-account`): pełny zielony gradient tła + biały text.

**Logout** — zamiast `variant="outline"`:
- Zachowujemy outline, ale z `border-primary/30`, `text-primary-deep`, hover `bg-primary/8 border-primary/60`.
- Ikona `LogOut` po lewej dla spójności wizualnej.

**Login / Sign Up** (niezalogowany):
- Zamiast szarego ghost: pigułka `bg-primary/8 ring-1 ring-primary/25 text-primary-deep`, hover `bg-primary/15 ring-primary/45`. Ikona `LogIn` z lewej.

**List Your Space** — zostaje `btn-3d-primary` (już dobrze wygląda, jest brand-CTA).

### 3. Dropdown Zones — drobne wykończenie

- Zachowujemy strukturę, dodajemy `aria-current="page"` dla aktywnej zony (zaznaczone tłem `bg-primary/10` na stałe).
- Dropdown panel: lekko wzmocnić cień, tytuł "Choose a Zone" jako mały eyebrow nagłówek u góry (`text-[10px] uppercase tracking-[0.2em] text-primary/70 font-bold px-3 pt-2.5 pb-1`).

### 4. Cały navbar — drobne tła

- Bardziej wyrazisty separator: zostaje `bg-white/85 backdrop-blur-xl` (już glassmorphism), ale dorzucamy `border-b border-primary/10` żeby pasek miał lekką zieloną krawędź — wizualnie spina się z resztą stron.

## Czego NIE zmieniam

- Mobile drawer (`isMenuOpen`) — wygląda już dobrze, nie ruszamy.
- Logika Auth, Zones state, Escape/Click-outside, scroll-lock.
- Routing.
- Mobile bottom nav.

## Notatki techniczne

- Nowy import: `useLocation` z `react-router-dom` + `cn` z `@/lib/utils`.
- Dodaję `aria-current="page"` na aktywnym linku (a11y).
- Animacje przez Tailwind transitions (bez nowych keyframes).
- Wszystkie kolory przez semantic tokens (`primary`, `primary-glow`, `primary-deep`).
- Bez zmian w `index.css` / `tailwind.config.ts`.
