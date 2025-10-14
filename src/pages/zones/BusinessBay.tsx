
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
import businessBayHero from "@/assets/zones/business-bay-real.jpg";
import { formatDescription } from "@/utils/formatDescription";


const BusinessBay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSpotName, setSelectedSpotName] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Use the new parking availability hook
  const { parkingSpots, loading, error } = useParkingAvailability("Business Bay");


  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 5000]);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative h-[300px] sm:h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${businessBayHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">Business Bay</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 mb-4 leading-relaxed">Business Bay brings together startups, SMEs, and large corporates across hundreds of commercial towers. Professionals here often navigate busy schedules between client meetings, coworking spaces, and high-rise offices along Al A'amal Street and Marasi Drive.</p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-black/20 inline-block px-3 py-2 sm:px-4 rounded-lg">Secure a monthly parking bay from AED650</p>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in Business Bay`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSpots.map(spot => (
              <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image carousel */}
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group">
                  {spot.images && spot.images.length > 0 ? (
                    <>
                      <img 
                        src={spot.images[currentImageIndexes[spot.id] || 0]} 
                        alt={`${spot.name} - Image ${(currentImageIndexes[spot.id] || 0) + 1}`} 
                        className="w-full h-full object-cover cursor-pointer" 
                        onClick={() => handleImageClick(spot, currentImageIndexes[spot.id] || 0)}
                      />
                      {spot.images.length > 1 && (
                        <>
                          {/* Navigation buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage(spot.id, spot.images.length);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage(spot.id, spot.images.length);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          
                          {/* Image indicator dots */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {spot.images.map((_: any, index: number) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndexes(prev => ({
                                    ...prev,
                                    [spot.id]: index
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  (currentImageIndexes[spot.id] || 0) === index ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Image counter */}
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {(currentImageIndexes[spot.id] || 0) + 1} / {spot.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <img 
                      src={spot.image} 
                      alt={spot.name} 
                      className="w-full h-full object-cover cursor-pointer" 
                      onClick={() => handleImageClick(spot, 0)}
                    />
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                  <div className="mb-4">
                    {formatDescription(spot.description) || (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Secure underground parking space. 24/7 access, covered area.
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                  </div>

                  {spot.available ? (
                    <Button 
                      onClick={() => handleReserveClick(spot)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 sm:py-3 rounded font-semibold text-sm sm:text-base"
                    >
                      Book Now
                    </Button>
                  ) : (
                    <div className="w-full bg-red-500 text-white py-2 sm:py-3 rounded text-center font-semibold text-sm sm:text-base">
                      Currently Booked
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>

        {filteredSpots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No parking spaces found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

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

export default BusinessBay;
