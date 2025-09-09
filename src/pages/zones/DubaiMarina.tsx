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
import dubaiMarinaHero from "@/assets/zones/dubai-marina-real.jpg";

const DubaiMarina = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]);
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

    // Set up real-time subscription to parking_listings changes
    const channel = supabase.channel('parking-listings-dubai-marina').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_listings'
    }, payload => {
      console.log('Real-time parking listing change in Dubai Marina:', payload);
      // Refetch data when any parking listing changes
      fetchParkingSpots();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchParkingSpots = async () => {
    console.log('Fetching parking spots for Dubai Marina...');
    try {
      // For security: Only fetch contact info if user is authenticated
      const { data, error } = await supabase.from('parking_listings_public').select("*").eq('zone', 'Dubai Marina');
      console.log('Supabase query result:', {
        data,
        error
      });
      if (error) throw error;

      // Transform data to match UI expectations
      const transformedData = data.map(spot => ({
        id: spot.id,
        name: spot.title,
        district: "Dubai Marina",
        price: spot.price_per_month || 0,
        image: spot.images && spot.images.length > 0 ? spot.images[0] : "/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png",
        images: spot.images || [],
        // Pass the full images array
        specs: spot.features || ["Access Card", "Covered", "2.1m Height"],
        available: true,
        address: spot.address,
        description: spot.description
      }));
      console.log('Transformed data:', transformedData);

      // If no data from database, use demo data
      if (transformedData.length === 0) {
        console.log('No data from database, using demo data');
        setParkingSpots([
          {
            id: "demo-1",
            name: "LIV Residence",
            district: "Dubai Marina",
            price: 500,
            image: "/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png",
            images: ["/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png", "/lovable-uploads/32249908-791f-4751-bdaa-b25414bbcd86.png"],
            specs: ["Access Card", "Covered", "24/7 Access"],
            available: true,
            address: "LIV Residence, Dubai Marina",
            description: "Covered parking in LIV Residence tower. 24/7 access and secure entry. Ideal for residents or nearby tenants."
          },
          {
            id: "demo-2",
            name: "Marina Plaza",
            district: "Dubai Marina",
            price: 600,
            image: "/lovable-uploads/32249908-791f-4751-bdaa-b25414bbcd86.png",
            images: ["/lovable-uploads/32249908-791f-4751-bdaa-b25414bbcd86.png", "/lovable-uploads/bff8556c-9c7b-4765-820d-b007ca48c5ac.png"],
            specs: ["Access Card", "Basement", "Prime Location"],
            available: true,
            address: "Marina Plaza, Dubai Marina",
            description: "Prime location in Marina Plaza. Basement parking with access control. Great for office tenants or regular visitors."
          },
          {
            id: "demo-3",
            name: "Marina Diamond 2",
            district: "Dubai Marina",
            price: 500,
            image: "/lovable-uploads/bff8556c-9c7b-4765-820d-b007ca48c5ac.png",
            images: ["/lovable-uploads/bff8556c-9c7b-4765-820d-b007ca48c5ac.png", "/lovable-uploads/cc70ca6e-a718-4baf-b612-9ddb5c9f07d4.png"],
            specs: ["Access Card", "Indoor", "Metro Access"],
            available: true,
            address: "Marina Diamond 2, Dubai Marina",
            description: "Indoor parking in Marina Diamond 2, secure access and great location next to metro."
          },
          {
            id: "demo-4",
            name: "Marina Diamond 2 – Slot 2",
            district: "Dubai Marina",
            price: 500,
            image: "/lovable-uploads/cc70ca6e-a718-4baf-b612-9ddb5c9f07d4.png",
            images: ["/lovable-uploads/cc70ca6e-a718-4baf-b612-9ddb5c9f07d4.png", "/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png"],
            specs: ["Access Card", "Indoor", "Second Slot"],
            available: true,
            address: "Marina Diamond 2, Dubai Marina",
            description: "Second slot in Marina Diamond 2. Perfect for families with two vehicles or friends."
          },
          {
            id: "demo-5",
            name: "Park Island",
            district: "Dubai Marina",
            price: 1500,
            image: "/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png",
            images: ["/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png", "/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png"],
            specs: ["Keycard Access", "Covered", "Convenient"],
            available: true,
            address: "Park Island, Dubai Marina",
            description: "Covered parking in Park Island complex. Access via keycard, safe and convenient."
          }
        ]);
      } else {
        setParkingSpots(transformedData);
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      // Fallback to demo data if database query fails
      setParkingSpots([{
        id: 1,
        name: "LIV Residence",
        district: "Dubai Marina",
        price: 650,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.1m Height"],
        available: true,
        address: "Dubai Marina Walk, Dubai Marina",
        description: "Premium parking space in luxury residential tower with 24/7 security and valet service."
      }, {
        id: 2,
        name: "Marina Residence",
        district: "Dubai Marina",
        price: 420,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.2m Height"],
        available: true,
        address: "Marina Promenade, Dubai Marina",
        description: "Secure underground parking with easy access to Marina Walk and JBR Beach."
      }, {
        id: 3,
        name: "Murjan Tower",
        district: "Dubai Marina",
        price: 450,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.0m Height"],
        available: true,
        address: "Al Marsa Street, Dubai Marina",
        description: "Modern parking facility with electric charging points and car wash services."
      }, {
        id: 4,
        name: "Marina Diamond",
        district: "Dubai Marina",
        price: 580,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.3m Height", "Electric Charging"],
        available: true,
        address: "Marina Diamond Complex, Dubai Marina",
        description: "High-end parking with electric vehicle charging stations and concierge services."
      }, {
        id: 5,
        name: "The Torch Tower",
        district: "Dubai Marina",
        price: 480,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.1m Height"],
        available: true,
        address: "Torch Tower, Dubai Marina",
        description: "Central location with direct access to Dubai Marina Metro Station."
      }, {
        id: 6,
        name: "Cayan Tower",
        district: "Dubai Marina",
        price: 520,
        image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
        specs: ["Access Card", "Covered", "2.2m Height", "Valet Service"],
        available: true,
        address: "Cayan Tower, Dubai Marina",
        description: "Iconic twisted tower with premium valet parking services and Marina views."
      }]);
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 20000]); // Updated to match new default
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
      <div className="relative h-[300px] sm:h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${dubaiMarinaHero})`
      }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">Dubai Marina</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 mb-4 leading-relaxed">This vibrant waterfront district blends lifestyle with business. With offices in Marina Plaza and Al Habtoor Tower, as well as frequent movement between JBR, JLT, and Media City, many rely on being close to where they live or work.</p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold bg-black/20 inline-block px-3 py-2 sm:px-4 rounded-lg">Secure a monthly parking bay from AED600</p>
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
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in Dubai Marina`}
          </p>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSpots.map(spot => <Link key={spot.id} to={`/parking/${spot.id}`}>
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              {/* Image carousel */}
              <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group">
                {spot.images && spot.images.length > 0 ? <>
                    <img 
                      src={spot.images[currentImageIndexes[spot.id] || 0]} 
                      alt={`${spot.name} - Image ${(currentImageIndexes[spot.id] || 0) + 1}`} 
                      className="w-full h-full object-cover cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(spot, currentImageIndexes[spot.id] || 0);
                      }}
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

              {/* Content */}
              <div className="p-4 sm:p-6">
                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                
                {/* Short description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                  {spot.description || "Secure underground parking space. 24/7 access, covered area."}
                </p>

                {/* Price prominently displayed */}
                <div className="mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                </div>

                <div className="w-full bg-green-500 text-white py-2 sm:py-3 rounded text-center font-semibold text-sm sm:text-base">
                  Available for Booking
                </div>
              </div>
            </Card>
          </Link>)}
        </div>

        {filteredSpots.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No parking spaces found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>}
      </div>
      
      <ParkingBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} parkingSpot={selectedSpot} />
      <ImageZoomModal 
        isOpen={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        images={selectedImages}
        initialIndex={selectedImageIndex}
        spotName={selectedSpotName}
      />
      
      <Footer />
    </div>;
};

export default DubaiMarina;
