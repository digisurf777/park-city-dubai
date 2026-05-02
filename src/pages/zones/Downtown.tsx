import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Car, CreditCard, Ruler, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ParkingBookingModal } from "@/components/ParkingBookingModal";
import ImageZoomModal from "@/components/ImageZoomModal";
import { useParkingAvailability } from "@/hooks/useParkingAvailability";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import downtownHero from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp";
import { formatDescription } from "@/utils/formatDescription";
import LazyImage from "@/components/LazyImage";
import DubaiLiveMapsCTA from "@/components/DubaiLiveMapsCTA";

const Downtown = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{
    [key: string]: number;
  }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSpotName, setSelectedSpotName] = useState("");
  
  // Use the new parking availability hook
  const { parkingSpots, loading, error } = useParkingAvailability("Downtown");
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 20000]);
    setShowAvailableOnly(false);
  };
  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const matchesAvailability = !showAvailableOnly || spot.available;
    return matchesSearch && matchesPrice && matchesAvailability;
  });
  const minPrice = parkingSpots.length > 0 ? Math.min(...parkingSpots.map(spot => spot.price)) : 0;
  const handleReserveClick = (spot: any) => {
    setSelectedSpot(spot);
    setIsBookingModalOpen(true);
  };

  const handleImageClick = (spot: any, imageIndex: number) => {
    setSelectedImages(spot.images && spot.images.length > 0 ? spot.images : [spot.image]);
    setSelectedImageIndex(imageIndex);
    setSelectedSpotName(spot.name);
    setIsImageModalOpen(true);
  };
  const nextImage = (spotId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) + 1) % totalImages
    }));
  };
  const prevImage = (spotId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) - 1 + totalImages) % totalImages
    }));
  };
  return <div className="min-h-screen bg-gradient-to-b from-surface to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[480px] sm:min-h-[600px] pt-20 sm:pt-24 overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.04]"
          style={{ backgroundImage: `url(${downtownHero})` }}
          aria-hidden="true"
        />
        {/* Brand teal cinematic tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary-deep) / 0.78) 0%, hsl(var(--primary) / 0.55) 45%, hsl(220 50% 8% / 0.65) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Bottom darken for text legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {/* Top vignette */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        {/* Decorative glowing orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-glow/30 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl" />
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-center min-h-[480px] sm:min-h-[600px]">
          <div className="text-center px-4 max-w-4xl mx-auto py-12 animate-fade-in">
            {/* Eyebrow chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_4px_16px_-4px_hsl(var(--primary-deep)/0.5),inset_0_1px_0_0_hsl(0_0%_100%/0.3)]">
              <MapPin className="h-3.5 w-3.5 text-primary-glow" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/95">
                Dubai · Premium zone
              </span>
            </div>

            {/* Headline with gradient */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-[1.05] tracking-tight">
              <span className="block bg-gradient-to-br from-white via-white to-primary-glow/90 bg-clip-text text-transparent drop-shadow-[0_4px_20px_hsl(var(--primary-deep)/0.6)]">
                Downtown
              </span>
              <span className="block text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-1 text-primary-glow drop-shadow-[0_2px_12px_hsl(var(--primary-glow)/0.5)]">
                Dubai
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              The corporate heart of Dubai. Home to Emaar Square, Boulevard Plaza and the city&apos;s most prestigious hospitality and retail brands.
            </p>

            {/* Premium pricing badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/30 shadow-[0_12px_32px_-8px_hsl(var(--primary-deep)/0.6),inset_0_1px_0_0_hsl(0_0%_100%/0.4)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-glow to-primary text-white shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.5)]">
                <Car className="h-4 w-4" />
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary-glow leading-none">From</p>
                <p className="text-base sm:text-lg font-black text-white leading-tight">
                  AED 750 <span className="text-xs font-semibold text-white/70">/ month</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${filteredSpots.length} spaces found in Downtown Dubai`}
            </p>
          </div>
          <DubaiLiveMapsCTA variant="compact" />
        </div>

        {/* Listing Grid - 3D glowing frames */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {filteredSpots.map(spot => (
            <div
              key={spot.id}
              className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)',
                boxShadow: '0 20px 40px -15px hsl(var(--primary-deep) / 0.45), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)',
              }}
            >
            <Card className="overflow-hidden rounded-[14px] border-0 bg-white h-full flex flex-col">
              {/* Image carousel */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                {/* glossy top highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent z-20" />
                <img
                  src={(spot.images && spot.images.length > 0 ? spot.images[currentImageIndexes[spot.id] || 0] : spot.image)}
                  alt={spot.name || "Downtown Dubai parking space"}
                  aria-hidden="true"
                  className="hidden"
                />
                {spot.images && spot.images.length > 0 ? <>
                <div className="relative z-10 h-full w-full flex items-center justify-center">
                  <LazyImage 
                    src={spot.images[currentImageIndexes[spot.id] || 0]} 
                    alt={`${spot.name} - Image ${(currentImageIndexes[spot.id] || 0) + 1}`} 
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" 
                    loading="lazy"
                    fetchPriority="low"
                    onClick={() => handleImageClick(spot, currentImageIndexes[spot.id] || 0)}
                  />
                </div>
                    {spot.images.length > 1 && <>
                        {/* Navigation buttons */}
                        <button onClick={e => {
                  e.stopPropagation();
                  prevImage(spot.id, spot.images.length);
                }} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={e => {
                  e.stopPropagation();
                  nextImage(spot.id, spot.images.length);
                }} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        
                        {/* Image indicator dots */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {spot.images.map((_: any, index: number) => <button key={index} onClick={e => {
                    e.stopPropagation();
                    setCurrentImageIndexes(prev => ({
                      ...prev,
                      [spot.id]: index
                    }));
                  }} className={`w-2 h-2 rounded-full transition-colors ${(currentImageIndexes[spot.id] || 0) === index ? 'bg-white' : 'bg-white/50'}`} />)}
                        </div>
                        
                        {/* Image counter */}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {(currentImageIndexes[spot.id] || 0) + 1} / {spot.images.length}
                        </div>
                      </>}
                  </> : <LazyImage 
                    src={spot.image} 
                    alt={spot.name} 
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105" 
                    loading="lazy"
                    fetchPriority="low"
                    onClick={() => handleImageClick(spot, 0)}
                  />}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-2 min-h-[3.5rem]">{spot.name}</h3>

                {/* Description - fixed visual height keeps cards aligned */}
                <div className="relative mb-4 h-[7.5rem] overflow-hidden">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {formatDescription(spot.description) || (
                      <p>Secure underground parking space. 24/7 access, covered area.</p>
                    )}
                  </div>
                  {/* fade-out gradient at bottom for clipped content */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
                </div>

                {/* Spacer pushes price + CTA to bottom */}
                <div className="mt-auto">
                  {/* Price prominently displayed */}
                  <div className="mb-3">
                    <span className="text-xl sm:text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                  </div>

                  {spot.available ? (
                    <Button
                      onClick={() => handleReserveClick(spot)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded font-semibold text-sm sm:text-base"
                    >
                      Book Now
                    </Button>
                  ) : (
                    <div className="w-full bg-red-500 text-white h-11 flex items-center justify-center rounded font-semibold text-sm sm:text-base">
                      Currently Booked
                    </div>
                  )}
                </div>
              </div>
            </Card>
            </div>
          ))}
        </div>

        {filteredSpots.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No parking spaces found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>}

        {/* Dubai Live Maps CTA */}
        <DubaiLiveMapsCTA zoneName="Downtown Dubai" />
      </div>

      <Footer />

      {/* Booking Modal */}
      <ParkingBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} parkingSpot={selectedSpot} />
      <ImageZoomModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        images={selectedImages}
        initialIndex={selectedImageIndex}
        spotName={selectedSpotName}
      />
    </div>;
};
export default Downtown;