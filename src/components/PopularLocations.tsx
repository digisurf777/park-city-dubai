import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const locations = [
  {
    name: "Dubai Marina",
    link: "/zones/dubai-marina",
    image: "/assets/zones/dubai-marina.webp"
  },
  {
    name: "Downtown",
    link: "/find-parking?district=downtown",
    image: "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp"
  },
  {
    name: "Palm Jumeirah",
    link: "/find-parking?district=palm-jumeirah",
    image: "/lovable-uploads/atlantis-hotel-hero.webp"
  },
  {
    name: "Business Bay",
    link: "/find-parking?district=business-bay",
    image: "/assets/zones/business-bay.webp"
  },
  {
    name: "DIFC",
    link: "/find-parking?district=difc",
    image: "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.webp"
  },
  {
    name: "Deira",
    link: "/find-parking?district=deira",
    image: "/assets/zones/deira.webp"
  }
];

const PopularLocations = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white via-primary/5 to-white overflow-hidden">
      {/* Decorative brand glows */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary-deep">
            ★ Explore Dubai
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            POPULAR PARKING LOCATIONS IN DUBAI
          </h2>
          <div className="mx-auto h-1 w-20 sm:w-28 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {locations.map((location, index) => (
            <div
              key={index}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 3D framed card with branded gradient border + soft pulsing glow */}
              <div
                className="relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2 animate-frame-pulse"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)',
                  animationDelay: `${index * 0.4}s`,
                }}
              >
                <Card className="relative overflow-hidden rounded-[14px] border-0 bg-white">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Image overlay — darker at bottom for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/60" />
                    {/* Glossy top highlight for 3D feel */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />

                    <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-5 sm:p-6">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 uppercase text-center drop-shadow-lg tracking-wide">
                        {location.name}
                      </h3>
                      <Link to={location.link} className="w-full sm:w-auto">
                        <Button
                          className="bg-white text-primary-deep hover:bg-white/95 px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105 touch-manipulation min-h-[44px] shadow-[0_8px_20px_-6px_hsl(var(--primary-deep)/0.5)] border border-white/60"
                        >
                          Select Zone
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