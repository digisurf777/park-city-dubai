import { Shield, Lock, BadgeCheck, Award, Sparkles, CreditCard, Building2, MapPin } from "lucide-react";
import shazamLogo from "@/assets/ecosystem/shazam-logo.png";
import dubaiLifeOs from "@/assets/ecosystem/dubai-life-os-logo.png";
import dubaiLifeMaps from "@/assets/ecosystem/dubai-life-maps-logo.png";

const BADGES = [
  { Icon: Shield, label: "RTA Compliant" },
  { Icon: Lock, label: "PCI-DSS Secure" },
  { Icon: BadgeCheck, label: "Verified Owners" },
  { Icon: Award, label: "Top Rated 2026" },
  { Icon: CreditCard, label: "Stripe Payments" },
  { Icon: Building2, label: "1,200+ Buildings" },
  { Icon: MapPin, label: "All Dubai Zones" },
  { Icon: Sparkles, label: "5-Star Service" },
];

const PARTNERS = [
  { src: shazamLogo, alt: "Shazam Technology Group" },
  { src: dubaiLifeOs, alt: "Dubai Life OS" },
  { src: dubaiLifeMaps, alt: "Dubai Life Maps" },
];

const TrustedPlatform = () => {
  const loop = [...BADGES, ...BADGES];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-surface to-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-12 relative">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <BadgeCheck className="h-3.5 w-3.5" /> Trusted Platform
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Dubai's most trusted parking platform
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Backed by the Shazam ecosystem and trusted by thousands of drivers and property owners.
        </p>
      </div>

      {/* Partner logos — centered, animated */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14 relative">
        <div className="grid grid-cols-3 gap-4 sm:gap-8 items-center">
          {PARTNERS.map((p, i) => (
            <div
              key={p.alt}
              className="group relative flex items-center justify-center p-4 sm:p-6 rounded-2xl bg-white ring-1 ring-primary/15 shadow-[0_12px_30px_-15px_hsl(var(--primary)/0.4)] hover:ring-primary/40 transition-all duration-300 animate-frame-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <img
                src={p.src}
                alt={p.alt}
                className="h-12 sm:h-16 md:h-20 w-auto object-contain animate-logo-float"
                style={{ animationDelay: `${i * 0.6}s` }}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges marquee */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max animate-marquee-fast">
          {loop.map(({ Icon, label }, i) => (
            <div
              key={`${label}-${i}`}
              className="shrink-0 mx-3 flex items-center gap-2 px-5 py-3 rounded-full bg-white ring-1 ring-primary/15 shadow-sm hover:ring-primary/40 transition-colors"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {[
          { v: "1,200+", l: "Active drivers" },
          { v: "850+", l: "Listed spaces" },
          { v: "4.9★", l: "Average rating" },
          { v: "24/7", l: "Live support" },
        ].map((s) => (
          <div
            key={s.l}
            className="text-center p-5 rounded-2xl bg-white ring-1 ring-primary/15 shadow-[0_10px_24px_-15px_hsl(var(--primary)/0.4)]"
          >
            <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-transparent">
              {s.v}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustedPlatform;
