## Cel

Strony zone (`/deira`, `/difc`, `/palm-jumeirah`, `/business-bay`, `/downtown`, `/dubai-marina`) wyglądają jak nieukończone — płaski hero z czarnym overlay, pusty pasek filtrów, brak zielonych akcentów platformy, brak gradient ramek na kartach, brak CTA. Trzeba je doprowadzić do spójnego, premium stylu landing page (gradient frames, glassmorphism, zielone podświetlenia, animacje).

## Co budujemy

### 1. Nowy współdzielony komponent `ZonePageLayout`

Plik: `src/components/zones/ZonePageLayout.tsx`

Jeden komponent obsługujący całą strukturę strony zone — eliminuje 1500+ linii duplikacji i gwarantuje 100% spójności. Każda strona zone redukuje się do ~30 linii konfiguracji.

Props:
```
{
  zoneName: string                    // "Deira"
  zoneSlug: string                    // używane przez useParkingAvailability
  heroImage: string
  description: string
  fromPrice: number                   // 500, 600, 850...
  highlights: { icon, title, text }[] // 3-4 punkty "Why park here"
  nearbyLandmarks?: string[]          // chipy z lokalizacjami
}
```

Strony zone (`Deira.tsx`, `DIFC.tsx`, ...) stają się cienkimi wrapperami, które wołają `<ZonePageLayout zoneName="Deira" ... />`.

### 2. Sekcje nowego layoutu

**Hero (premium, jak landing)**
- Tło: zdjęcie strefy z gradientem `linear-gradient(135deg, primary-deep/55, primary/30, transparent)` zamiast płaskiego `black/35`.
- Animowane glow blobs (jak na landing).
- Badge "Trusted in Dubai" z `glass` i ikoną Sparkles.
- Tytuł: dwuwierszowy, z gradient-text na nazwie strefy (`from-primary-glow via-white to-primary-glow`).
- Opis + chip "Secure a monthly parking bay from AED X" z glassmorphism (nie czarny).
- Dwa CTA: "Browse Spaces" (scroll do listingu) + "List Your Space" (link do `/rent-out-your-space`).
- Animacje wejścia z `framer-motion` stagger (jak na landing).

**Why park in {zone} – highlights strip**
- 3-4 karty z ikonami (Shield, Zap, MapPin, Clock).
- Glassmorphism + zielona ramka gradientowa, ten sam styl co "How It Works" na landing.
- Treść per-zone (np. dla Deira: "Heritage district", "24/7 secure", "Walk to metro", "From AED 500").

**Listing section header (jak "Popular Locations" na landing)**
- Eyebrow badge "Available Now" z ikoną MapPin.
- H2 z gradient text: `Parking Spaces in {zone}` (`from-primary via-primary-glow to-primary-deep`).
- Animowany divider (kreska–kropka–kreska) jak na landing.
- Licznik wyników poniżej.

**Karty parkingowe — gradient frame**
- Zachowujemy istniejącą logikę karuzeli/zooma (działa dobrze).
- Owijamy każdą `<Card>` w `<div>` z zielonym gradientem `p-[2px]` jak na "Explore Dubai" na landing.
- Subtelna zielona poświata pod kartą (radial blur, jak ostatnio dodaliśmy w Explore Dubai).
- Cena wyświetlana z gradient text w stylu primary.
- Przycisk "Book Now" — pełny wariant gradient z hover scale.
- Pusty stan ("No spaces found") — ładniejszy: ikona, tekst, button.

**Empty/loading skeletons**
- Podczas `loading` pokazujemy 6 skeleton-cards z shimmerem (zamiast pustki).

**Bottom CTA banner**
- Sekcja "Can't find what you need?" z gradientowym tłem primary→primary-deep, dwa CTA: "View All Locations" + "Contact Us".
- Spójna z banerami CTA z innych stron.

### 3. Drobne porządki

- Usunąć z plików zone niewykorzystane importy (`Input`, `Slider`, `Checkbox`, `Search`, `useToast`, `useAuth` w Deira itd. — pozostałości po starym filterze).
- Usunąć puste `sticky top-20` filter bary (były tylko strukturą bez treści).
- Downtown — zachować `<DubaiLiveMapsCTA />` (jest używany tylko tam, dorzucamy go jako opcjonalny prop do layoutu).
- Każda strona zachowuje swój `useSEO`-style `<title>` (dodajemy hook jeśli go nie ma — bez SEO regression).

### 4. Treści per-zone (highlights)

Każda strefa dostanie 3-4 zwięzłe punkty (1 zdanie każdy):

- **Deira**: Heritage commercial hub, Metro access, 24/7 secure, From AED 500.
- **DIFC**: Financial district core, Covered & guarded, Walk to metro, Premium spaces.
- **Palm Jumeirah**: Iconic island living, Beach & resort proximity, Resident-only buildings, From AED 850.
- **Business Bay**: Central business hub, Burj Khalifa views, 24/7 access, Easy SZR access.
- **Downtown**: Heart of Dubai, Walk to Burj/Mall, Premium covered spaces, Tourist-area convenience.
- **Dubai Marina**: Waterfront lifestyle, Tram & metro access, JBR walking distance, Building-secure.

## Zakres zmian

**Nowy plik:**
- `src/components/zones/ZonePageLayout.tsx` (~350 linii)

**Przepisane (każdy ~40 linii zamiast 250+):**
- `src/pages/zones/Deira.tsx`
- `src/pages/zones/DIFC.tsx`
- `src/pages/zones/PalmJumeirah.tsx`
- `src/pages/zones/BusinessBay.tsx`
- `src/pages/zones/Downtown.tsx`
- `src/pages/zones/DubaiMarina.tsx`

**Bez zmian:**
- Routing (`App.tsx`) — wszystkie obecne ścieżki działają bez zmian.
- Logika rezerwacji (`ParkingBookingModal`, `useParkingAvailability`) — bez ingerencji.
- `ImageZoomModal`, `LazyImage` — bez ingerencji.

## Notatki techniczne

- Wszystkie kolory przez semantic tokens (`primary`, `primary-glow`, `primary-deep`, `surface`, `muted`).
- Animacje przez `framer-motion` (już używane na landing) — `whileInView` + `staggerChildren`.
- Obrazki kart nadal lazy + cache via SW.
- Hero zachowuje `pt-20 sm:pt-24` żeby nie kolidować z fixed Navbar.
- Pełna zgodność mobile (podgląd na 375px sprawdzony w istniejących klasach `text-2xl sm:text-3xl`).
- Zero zmian w bazie / migracjach / API.
