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
import palmJumeirahHero from "/lovable-uploads/atlantis-hotel-hero.jpg";
const PalmJumeirah = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{
    [key: string]: number;
  }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSpotName, setSelectedSpotName] = useState("");
  useEffect(() => {
    fetchParkingSpots();
  }, []);
  const fetchParkingSpots = async () => {
    console.log("Fetching parking spots for Palm Jumeirah...");
    try {
      const {
        data,
        error
      } = await supabase.from("parking_listings").select("*").eq("zone", "Palm Jumeirah").eq("status", "approved");
      console.log("Supabase query result:", {
        data,
        error
      });
      if (error) throw error;

      // Transform data to match UI expectations
      const transformedData = data.map(spot => ({
        id: spot.id,
        name: spot.title,
        district: "Palm Jumeirah",
        price: spot.price_per_month || 0,
        image: spot.images && spot.images.length > 0 ? spot.images[0] : "/lovable-uploads/ba4a4def-2cd7-4e97-89d5-074c13f0bbe8.png",
        images: spot.images || [],
        specs: spot.features || ["Access Card", "Covered", "2.1m Height"],
        available: true,
        address: spot.address,
        description: spot.description
      }));
      console.log("Transformed data:", transformedData);

      // If no data from database, use demo data
      if (transformedData.length === 0) {
        console.log("No data from database, using demo data");
        setParkingSpots([{
          id: 1,
          name: "East Golf Tower",
          district: "Palm Jumeirah",
          price: 500,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Covered", "24/7 Security", "Premium"],
          available: true,
          address: "East Golf Tower, Palm Jumeirah",
          description: "Secure parking space in East Golf Tower with 24/7 access and premium amenities in the heart of Palm Jumeirah."
        }, {
          id: 2,
          name: "Shoreline Apartments",
          district: "Palm Jumeirah",
          price: 900,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Underground", "24/7 Security", "CCTV"],
          available: true,
          address: "Shoreline Apartments, Palm Jumeirah",
          description: "Secure underground parking in the heart of Palm Jumeirah with 24/7 security and CCTV surveillance."
        }, {
          id: 3,
          name: "The Palm Tower",
          district: "Palm Jumeirah",
          price: 800,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Underground", "24/7 Security", "Premium"],
          available: true,
          address: "The Palm Tower, Palm Jumeirah",
          description: "Underground parking garage in The Palm Tower, in the heart of Palm Jumeirah with 24/7 security."
        }]);
      } else {
        setParkingSpots(transformedData);
      }
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      setParkingSpots([{
        id: 1,
        name: "East Golf Tower",
        district: "Palm Jumeirah",
        price: 500,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Covered", "24/7 Security", "Premium"],
        available: true,
        address: "East Golf Tower, Palm Jumeirah",
        description: "Secure parking space in East Golf Tower with 24/7 access and premium amenities in the heart of Palm Jumeirah."
      }, {
        id: 2,
        name: "Shoreline Apartments",
        district: "Palm Jumeirah",
        price: 900,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Underground", "24/7 Security", "CCTV"],
        available: true,
        address: "Shoreline Apartments, Palm Jumeirah",
        description: "Secure underground parking in the heart of Palm Jumeirah with 24/7 security and CCTV surveillance."
      }, {
        id: 3,
        name: "The Palm Tower",
        district: "Palm Jumeirah",
        price: 800,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Underground", "24/7 Security", "Premium"],
        available: true,
        address: "The Palm Tower, Palm Jumeirah",
        description: "Underground parking garage in The Palm Tower, in the heart of Palm Jumeirah with 24/7 security."
      }]);
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1500]);
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
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${palmJumeirahHero})`
      }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in Palm Jumeirah</h1>
            <p className="text-xl md:text-2xl opacity-90">Luxury island living with world-class amenities</p>
            <p className="text-lg md:text-xl opacity-80 mt-2">Secure monthly bays to AED700</p>
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
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in Palm Jumeirah`}
          </p>
        </div>

        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map(spot => <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image carousel */}
                <div className="relative w-full h-64 overflow-hidden group">
                  {spot.images && spot.images.length > 0 ? <>
                      <img 
                        src={spot.images[currentImageIndexes[spot.id] || 0]} 
                        alt={`${spot.name} - Image ${(currentImageIndexes[spot.id] || 0) + 1}`} 
                        className="w-full h-full object-cover cursor-pointer" 
                        onClick={() => handleImageClick(spot, currentImageIndexes[spot.id] || 0)}
                      />
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
                    </> : <img 
                      src={spot.image} 
                      alt={spot.name} 
                      className="w-full h-full object-cover cursor-pointer" 
                      onClick={() => handleImageClick(spot, 0)}
                    />}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {spot.description || "Secure underground parking space. 24/7 access, covered area."}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                  </div>


                  <Button className="w-full bg-destructive hover:bg-destructive text-destructive-foreground font-semibold py-2 px-4 rounded-lg cursor-not-allowed" disabled>
                    Currently Booked
                  </Button>
                </div>
              </Card>)}
          </div>}

        {!loading && filteredSpots.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No parking spaces found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>}
      </div>

      <Footer />

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
export default PalmJumeirah;