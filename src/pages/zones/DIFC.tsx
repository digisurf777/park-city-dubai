
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Car, CreditCard, Ruler, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ParkingBookingModal } from "@/components/ParkingBookingModal";
import ImageZoomModal from "@/components/ImageZoomModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import difcHero from "@/assets/zones/difc-real.jpg";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const DIFC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSpotName, setSelectedSpotName] = useState("");
  const { previewMode } = useFeatureFlags();

  useEffect(() => {
    fetchParkingSpots();

    // Set up real-time subscription to parking_listings changes
    const channel = supabase
      .channel('parking-listings-difc')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_listings'
      }, (payload) => {
        console.log('Real-time parking listing change in DIFC:', payload);
        // Refetch data when any parking listing changes
        fetchParkingSpots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchParkingSpots = async () => {
    console.log("Fetching parking spots for DIFC...");
    try {
      const { data, error } = previewMode 
        ? await supabase.from("parking_listings").select("*").eq("zone", "DIFC")
        : await supabase.from("parking_listings").select("*").eq("zone", "DIFC").eq("status", "approved");
      
      console.log("Supabase query result:", { data, error });
      if (error) throw error;

      // Transform data to match UI expectations
      const transformedData = data.map(spot => ({
        id: spot.id,
        name: spot.title,
        district: "DIFC",
        price: spot.price_per_month || 0,
        image: spot.images && spot.images.length > 0 ? spot.images[0] : "/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png",
        images: spot.images || [],
        specs: spot.features || ["Access Card", "Covered", "2.1m Height"],
        available: !previewMode, // In preview mode, all spaces show as unavailable
        address: spot.address,
        description: spot.description
      }));

      console.log("Transformed data:", transformedData);

      // Always show transformed data (real data from database when available)
      setParkingSpots(transformedData.length > 0 ? transformedData : [
        {
          id: "demo-1",
          name: "Index Tower",
          district: "DIFC",
          price: 1200,
          image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
          images: ["/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", "/lovable-uploads/90ac71db-2b33-4d06-8b4e-7fdb761027f4.png"],
          specs: ["Premium", "24/7 Security", "Concierge"],
          available: !previewMode,
          address: "Index Tower, DIFC",
          description: "Premium parking space in Index Tower with 24/7 security and concierge services in the heart of DIFC."
        },
        {
          id: "demo-2",
          name: "Gate Village",
          district: "DIFC",
          price: 1500,
          image: "/lovable-uploads/90ac71db-2b33-4d06-8b4e-7fdb761027f4.png",
          images: ["/lovable-uploads/90ac71db-2b33-4d06-8b4e-7fdb761027f4.png", "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png"],
          specs: ["Underground", "CCTV", "Premium"],
          available: !previewMode,
          address: "Gate Village, DIFC",
          description: "Secure underground parking in the prestigious Gate Village with CCTV surveillance and premium amenities."
        }
      ]);
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      setParkingSpots([
        {
          id: "demo-1",
          name: "Index Tower",
          district: "DIFC",
          price: 1200,
          image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
          images: ["/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", "/lovable-uploads/90ac71db-2b33-4d06-8b4e-7fdb761027f4.png"],
          specs: ["Premium", "24/7 Security", "Concierge"],
          available: !previewMode,
          address: "Index Tower, DIFC",
          description: "Premium parking space in Index Tower with 24/7 security and concierge services in the heart of DIFC."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 2000]);
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
    if (previewMode) {
      console.log('Preview mode: Zone click telemetry', { zone: 'DIFC', spotId: spot.id, spotName: spot.name });
    }
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
      
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${difcHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in DIFC</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-4">A globally recognised financial centre, DIFC is home to leading law firms, banks, consultancies, and investment institutions. The area attracts daily professionals who value efficiency, proximity to their office, and smooth day-to-day routines.</p>
            <p className="text-lg md:text-xl font-semibold bg-black/20 inline-block px-4 py-2 rounded-lg">Secure a monthly parking bay from AED850</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in DIFC`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map(spot => (
              <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image carousel */}
                <div className="relative w-full h-64 overflow-hidden group">
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

                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {spot.description || "Secure underground parking space. 24/7 access, covered area."}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                  </div>

                  {previewMode ? (
                    <Link to={`/parking/${spot.id}`} onClick={() => console.info('PreviewMode reserve click', { spotId: spot.id })}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        Reserve Space
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full bg-destructive hover:bg-destructive text-destructive-foreground cursor-not-allowed" 
                      disabled
                    >
                      Currently Booked
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredSpots.length === 0 && (
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

export default DIFC;
