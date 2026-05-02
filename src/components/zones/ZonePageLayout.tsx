import { useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowRight,
  Search,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { ParkingBookingModal } from "@/components/ParkingBookingModal";
import ImageZoomModal from "@/components/ImageZoomModal";
import LazyImage from "@/components/LazyImage";
import DubaiLiveMapsCTA from "@/components/DubaiLiveMapsCTA";
import { useParkingAvailability } from "@/hooks/useParkingAvailability";
import { formatDescription } from "@/utils/formatDescription";
import useSEO from "@/hooks/useSEO";

export interface ZoneHighlight {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

export interface ZonePageLayoutProps {
  zoneName: string;
  /** Value passed to useParkingAvailability (e.g. "Deira", "Dubai Marina") */
  zoneSlug: string;
  heroImage: string;
  description: string;
  fromPrice: number;
  highlights: ZoneHighlight[];
  /** Optional SEO overrides */
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  /** Render the Dubai Live Maps CTA above the listing */
  showLiveMapsCTA?: boolean;
}

const ZonePageLayout = ({
  zoneName,
  zoneSlug,
  heroImage,
  description,
  fromPrice,
  highlights,
  seoTitle,
  seoDescription,
  seoKeywords,
  showLiveMapsCTA = false,
}: ZonePageLayoutProps) => {
  const seoData = useSEO({
    title: seoTitle ?? `Parking in ${zoneName} - Shazam Parking`,
    description:
      seoDescription ??
      `Find verified monthly parking spaces in ${zoneName}, Dubai. Secure, covered, and ready to book on Shazam Parking.`,
    keywords:
      seoKeywords ??
      `${zoneName} parking, Dubai parking, monthly parking ${zoneName}, secure parking ${zoneName}`,
    url: `/${zoneSlug.toLowerCase().replace(/\s+/g, "-")}`,
  });

  const { parkingSpots, loading } = useParkingAvailability(zoneSlug);

  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{
    [key: string]: number;
  }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSpotName, setSelectedSpotName] = useState("");

  const handleReserveClick = (spot: any) => {
    setSelectedSpot(spot);
    setIsBookingModalOpen(true);
  };

  const handleImageClick = (spot: any, imageIndex: number) => {
    setSelectedImages(
      spot.images && spot.images.length > 0 ? spot.images : [spot.image]
    );
    setSelectedImageIndex(imageIndex);
    setSelectedSpotName(spot.name);
    setIsImageModalOpen(true);
  };

  const nextImage = (spotId: string, totalImages: number) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) + 1) % totalImages,
    }));
  };

  const prevImage = (spotId: string, totalImages: number) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const scrollToListing = () => {
    document
      .getElementById("zone-listing")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background">
      {seoData}

      {/* ============= HERO ============= */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-20 sm:pt-24"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(174 60% 18% / 0.65) 0%, hsl(174 55% 22% / 0.45) 50%, hsl(174 50% 30% / 0.30) 100%), url(${heroImage})`,
        }}
      >
        {/* Bottom legibility gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[22rem] h-[22rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-glow/15 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-white text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
            }}
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              Verified spaces in {zoneName}
            </motion.span>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
              className="text-[2rem] leading-[1.05] sm:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-5"
            >
              <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                Park in
              </span>
              <span className="block bg-gradient-to-r from-primary-glow via-white to-primary-glow bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                {zoneName}
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="text-sm sm:text-base lg:text-lg text-white/95 max-w-2xl mx-auto mb-5 sm:mb-7 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            >
              {description}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/40 text-white text-xs sm:text-sm font-bold mb-6 sm:mb-8"
            >
              <span className="text-primary-glow">●</span>
              Secure a monthly bay from
              <span className="text-base sm:text-lg font-black bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">
                AED {fromPrice}
              </span>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center"
            >
              <Button
                size="lg"
                onClick={scrollToListing}
                className="w-full sm:w-auto px-6 py-5 text-sm sm:text-base font-semibold"
              >
                Browse Spaces
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Link to="/rent-out-your-space">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-5 text-sm sm:text-base font-semibold bg-white/15 border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-md"
                >
                  List Your Space
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============= HIGHLIGHTS ============= */}
      {highlights.length > 0 && (
        <section className="py-10 sm:py-14 bg-gradient-subtle">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {highlights.map((h, i) => {
                const Icon = h.icon;
                return (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl p-[1.5px]"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                    }}
                  >
                    <div className="h-full rounded-[14px] bg-white/90 backdrop-blur-sm p-4 sm:p-5 flex flex-col items-start gap-2 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25)]">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.4)]">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        {h.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                        {h.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============= LISTING ============= */}
      <section
        id="zone-listing"
        className="py-12 sm:py-16 lg:py-20 bg-white scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-primary-glow/15 ring-1 ring-primary/25 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-primary-deep shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Available Now
            </span>
            <h2 className="font-black tracking-tight text-3xl sm:text-5xl lg:text-6xl mb-4 leading-[0.95] px-4 text-balance">
              <span className="block text-slate-900">Parking Spaces in</span>
              <span className="block bg-gradient-to-r from-primary via-primary-glow to-primary-deep bg-clip-text text-transparent pb-1">
                {zoneName}
              </span>
            </h2>
            <div className="mx-auto flex items-center justify-center gap-2 mt-3">
              <span className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-transparent to-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-l from-transparent to-primary" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              {loading
                ? "Loading available spaces…"
                : `${parkingSpots.length} verified ${
                    parkingSpots.length === 1 ? "space" : "spaces"
                  } in ${zoneName}`}
            </p>
          </div>

          {showLiveMapsCTA && <DubaiLiveMapsCTA zoneName={zoneName} />}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-[2px]"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--primary-glow) / 0.4))",
                  }}
                >
                  <div className="rounded-[14px] bg-white overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-muted via-muted/70 to-muted animate-pulse" />
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-full bg-muted/80 rounded animate-pulse" />
                      <div className="h-3 w-4/5 bg-muted/80 rounded animate-pulse" />
                      <div className="h-9 w-full bg-muted rounded-lg animate-pulse mt-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && parkingSpots.length === 0 && (
            <div className="max-w-md mx-auto text-center py-12 sm:py-16">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary-glow/15 ring-1 ring-primary/20 flex items-center justify-center mb-5">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No spaces available yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;re onboarding new spaces in {zoneName} every week. Browse
                other locations or list your own space.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/find-parking">
                  <Button className="w-full sm:w-auto">View All Locations</Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <Button variant="outline" className="w-full sm:w-auto">
                    List Your Space
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Cards */}
          {!loading && parkingSpots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {parkingSpots.map((spot, idx) => (
                <motion.div
                  key={spot.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (idx % 6) * 0.05 }}
                  viewport={{ once: true, amount: 0.15 }}
                  className="group relative h-full flex"
                >
                  {/* Subtle green underglow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 left-4 right-4 h-8 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, hsl(var(--primary-glow) / 0.45) 0%, hsl(var(--primary) / 0.18) 45%, transparent 75%)",
                    }}
                  />
                  {/* Gradient frame */}
                  <div
                    className="relative rounded-2xl p-[2px] transition-all duration-500 group-hover:-translate-y-1.5 shadow-[0_18px_40px_-18px_hsl(var(--primary-deep)/0.45)] group-hover:shadow-[0_28px_60px_-20px_hsl(var(--primary)/0.55)] flex-1 flex"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                    }}
                  >
                    <Card className="overflow-hidden rounded-[14px] border-0 bg-white flex-1 flex flex-col">
                      {/* Image */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={
                            spot.images && spot.images.length > 0
                              ? spot.images[currentImageIndexes[spot.id] || 0]
                              : spot.image
                          }
                          alt={spot.name || `${zoneName} parking space`}
                          aria-hidden="true"
                          className="hidden"
                        />
                        {spot.images && spot.images.length > 0 ? (
                          <>
                            <LazyImage
                              src={spot.images[currentImageIndexes[spot.id] || 0]}
                              alt={`${spot.name} - Image ${
                                (currentImageIndexes[spot.id] || 0) + 1
                              }`}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                              fetchPriority="low"
                              onClick={() =>
                                handleImageClick(
                                  spot,
                                  currentImageIndexes[spot.id] || 0
                                )
                              }
                            />
                            {spot.images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  aria-label="Previous image"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage(spot.id, spot.images.length);
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Next image"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage(spot.id, spot.images.length);
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/55 hover:bg-black/75 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                                  {spot.images.map((_: any, index: number) => (
                                    <button
                                      key={index}
                                      type="button"
                                      aria-label={`Go to image ${index + 1}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndexes((prev) => ({
                                          ...prev,
                                          [spot.id]: index,
                                        }));
                                      }}
                                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        (currentImageIndexes[spot.id] || 0) ===
                                        index
                                          ? "bg-white w-4"
                                          : "bg-white/55"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="absolute top-2 right-2 bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  {(currentImageIndexes[spot.id] || 0) + 1} /{" "}
                                  {spot.images.length}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <LazyImage
                            src={spot.image}
                            alt={spot.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            fetchPriority="low"
                            onClick={() => handleImageClick(spot, 0)}
                          />
                        )}
                        {/* Inner bottom green glow for unified 3D feel */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                          style={{
                            background:
                              "radial-gradient(ellipse at 50% 110%, hsl(var(--primary-glow) / 0.35) 0%, hsl(var(--primary) / 0.12) 35%, transparent 70%)",
                            mixBlendMode: "screen",
                          }}
                        />
                        {/* Availability badge */}
                        <div className="absolute top-2 left-2">
                          {spot.available ? (
                            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                              Booked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 leading-tight line-clamp-2">
                          {spot.name}
                        </h3>
                        <div className="mb-4 min-h-[3rem]">
                          {formatDescription(spot.description) || (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Secure parking space. 24/7 access, covered area.
                            </p>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-xs text-muted-foreground font-medium">
                            From
                          </span>
                          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent">
                            AED {spot.price}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            /month
                          </span>
                        </div>

                        {spot.available ? (
                          <Button
                            onClick={() => handleReserveClick(spot)}
                            className="w-full font-semibold group/btn"
                          >
                            Book Now
                            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            className="w-full font-semibold opacity-70"
                          >
                            Currently Booked
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============= BOTTOM CTA ============= */}
      <section className="py-12 sm:py-16 bg-gradient-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-3xl p-[2px] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
            }}
          >
            <div
              className="relative rounded-[22px] px-6 sm:px-12 py-10 sm:py-14 text-center text-white overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary-deep)) 0%, hsl(var(--primary)) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-glow/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight">
                  Can&apos;t find what you need in {zoneName}?
                </h3>
                <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-6">
                  Browse all Dubai locations or get in touch with our team —
                  we&apos;ll help you find the perfect monthly bay.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/find-parking">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full sm:w-auto px-6 font-semibold"
                    >
                      <MapPin className="mr-1 h-4 w-4" />
                      View All Locations
                    </Button>
                  </Link>
                  <Link to="/faq">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto px-6 font-semibold bg-white/10 border-white/50 text-white hover:bg-white hover:text-primary"
                    >
                      <Mail className="mr-1 h-4 w-4" />
                      Get in Touch
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ParkingBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        parkingSpot={selectedSpot}
      />
      <ImageZoomModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        spotName={selectedSpotName}
      />
    </div>
  );
};

export default ZonePageLayout;
