import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";

const locations = [
  {
    name: "Dubai Marina",
    tagline: "Waterfront living",
    link: "/dubai-marina",
    image: "/assets/zones/dubai-marina.webp",
  },
  {
    name: "Downtown",
    tagline: "Burj Khalifa district",
    link: "/downtown",
    image: "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp",
  },
  {
    name: "Palm Jumeirah",
    tagline: "Iconic island life",
    link: "/palm-jumeirah",
    image: "/lovable-uploads/atlantis-hotel-hero.webp",
  },
  {
    name: "Business Bay",
    tagline: "Corporate heart",
    link: "/business-bay",
    image: "/assets/zones/business-bay.webp",
  },
  {
    name: "DIFC",
    tagline: "Financial centre",
    link: "/difc",
    image: "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.webp",
  },
  {
    name: "Deira",
    tagline: "Historic Dubai",
    link: "/deira",
    image: "/assets/zones/deira.webp",
  },
];

const PopularLocations = () => {
  return (
    <section className="relative py-14 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-primary/5 to-white overflow-hidden">
      {/* Decorative brand glows */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-primary-glow/15 ring-1 ring-primary/25 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-primary-deep shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Explore Dubai
          </span>
          <h2
            className="font-black tracking-tight text-3xl sm:text-5xl lg:text-6xl mb-4 sm:mb-5 leading-[1.05]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            <span className="block text-slate-900">Popular Parking</span>
            <span className="block bg-gradient-to-r from-primary via-primary-glow to-primary-deep bg-clip-text text-transparent">
              Locations in Dubai
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 mb-6 px-4">
            Discover guaranteed monthly spaces in Dubai's most sought-after districts -
            verified, secure and ready to book.
          </p>
          <div className="mx-auto flex items-center justify-center gap-2">
            <span className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-transparent to-primary" />
            <MapPin className="h-4 w-4 text-primary" />
            <span className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {locations.map((location, index) => (
            <div
              key={location.name}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 3D framed card with branded gradient border + soft pulsing glow */}
              <div
                className="relative rounded-3xl p-[2.5px] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.015] animate-frame-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                  animationDelay: `${index * 0.4}s`,
                }}
              >
                <Card className="relative overflow-hidden rounded-[22px] border-0 bg-white shadow-xl">
                  <div className="relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden">
                    <img
                      src={location.image}
                      alt={`${location.name} parking spaces in Dubai`}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Bottom-darken overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
                    {/* Glossy top highlight */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
                    {/* Top-right pin chip */}
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-primary-deep shadow-sm">
                      <MapPin className="h-3 w-3" />
                      Dubai
                    </div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow mb-1.5">
                        {location.tagline}
                      </p>
                      <h3
                        className="text-2xl sm:text-3xl lg:text-[2rem] font-black mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {location.name}
                      </h3>
                      <Link to={location.link} className="block">
                        <Button
                          className="w-full bg-white text-primary-deep hover:bg-white px-5 py-3 text-sm sm:text-base font-bold transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary-glow group-hover:text-white touch-manipulation min-h-[46px] shadow-[0_10px_24px_-8px_hsl(var(--primary-deep)/0.55)] border border-white/70 rounded-xl"
                        >
                          Select Zone
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
