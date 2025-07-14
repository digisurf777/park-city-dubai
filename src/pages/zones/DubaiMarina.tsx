import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Car, CreditCard, Ruler, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ParkingBookingModal } from "@/components/ParkingBookingModal";
import dubaiMarinaHero from "@/assets/zones/dubai-marina.jpg";
const DubaiMarina = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]); 
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    console.log('Fetching parking spots for Dubai Marina...');
    try {
      const { data, error } = await supabase
        .from('parking_listings')
        .select('*')
        .eq('zone', 'Dubai Marina')
        .eq('status', 'approved');

      console.log('Supabase query result:', { data, error });

      if (error) throw error;

      // Transform data to match UI expectations
      const transformedData = data.map(spot => ({
        id: spot.id,
        name: spot.title,
        district: "Dubai Marina",
        price: spot.price_per_month || 0,
        image: spot.images?.[0] || "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
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
            id: 1,
            name: "LIV Residence",
            district: "Dubai Marina",
            price: 650,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.1m Height"],
            available: true,
            address: "Dubai Marina Walk, Dubai Marina",
            description: "Premium parking space in luxury residential tower with 24/7 security and valet service."
          },
          {
            id: 2,
            name: "Marina Residence",
            district: "Dubai Marina", 
            price: 420,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.2m Height"],
            available: true,
            address: "Marina Promenade, Dubai Marina",
            description: "Secure underground parking with easy access to Marina Walk and JBR Beach."
          },
          {
            id: 3,
            name: "Murjan Tower",
            district: "Dubai Marina",
            price: 450,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.0m Height"],
            available: true,
            address: "Al Marsa Street, Dubai Marina",
            description: "Modern parking facility with electric charging points and car wash services."
          },
          {
            id: 4,
            name: "Marina Diamond",
            district: "Dubai Marina",
            price: 580,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.3m Height", "Electric Charging"],
            available: true,
            address: "Marina Diamond Complex, Dubai Marina",
            description: "High-end parking with electric vehicle charging stations and concierge services."
          },
          {
            id: 5,
            name: "The Torch Tower",
            district: "Dubai Marina",
            price: 480,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.1m Height"],
            available: true,
            address: "Torch Tower, Dubai Marina",
            description: "Central location with direct access to Dubai Marina Metro Station."
          },
          {
            id: 6,
            name: "Cayan Tower",
            district: "Dubai Marina",
            price: 520,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Access Card", "Covered", "2.2m Height", "Valet Service"],
            available: true,
            address: "Cayan Tower, Dubai Marina",
            description: "Iconic twisted tower with premium valet parking services and Marina views."
          }
        ]);
      } else {
        setParkingSpots(transformedData);
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      // Fallback to demo data if database query fails
      setParkingSpots([
        {
          id: 1,
          name: "LIV Residence",
          district: "Dubai Marina",
          price: 650,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.1m Height"],
          available: true,
          address: "Dubai Marina Walk, Dubai Marina",
          description: "Premium parking space in luxury residential tower with 24/7 security and valet service."
        },
        {
          id: 2,
          name: "Marina Residence",
          district: "Dubai Marina", 
          price: 420,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.2m Height"],
          available: true,
          address: "Marina Promenade, Dubai Marina",
          description: "Secure underground parking with easy access to Marina Walk and JBR Beach."
        },
        {
          id: 3,
          name: "Murjan Tower",
          district: "Dubai Marina",
          price: 450,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.0m Height"],
          available: true,
          address: "Al Marsa Street, Dubai Marina",
          description: "Modern parking facility with electric charging points and car wash services."
        },
        {
          id: 4,
          name: "Marina Diamond",
          district: "Dubai Marina",
          price: 580,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.3m Height", "Electric Charging"],
          available: true,
          address: "Marina Diamond Complex, Dubai Marina",
          description: "High-end parking with electric vehicle charging stations and concierge services."
        },
        {
          id: 5,
          name: "The Torch Tower",
          district: "Dubai Marina",
          price: 480,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.1m Height"],
          available: true,
          address: "Torch Tower, Dubai Marina",
          description: "Central location with direct access to Dubai Marina Metro Station."
        },
        {
          id: 6,
          name: "Cayan Tower",
          district: "Dubai Marina",
          price: 520,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Access Card", "Covered", "2.2m Height", "Valet Service"],
          available: true,
          address: "Cayan Tower, Dubai Marina",
          description: "Iconic twisted tower with premium valet parking services and Marina views."
        }
      ]);
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
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: `url(${dubaiMarinaHero})`
      }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in Dubai Marina</h1>
            <p className="text-xl md:text-2xl opacity-90">Picturesque waterfront district with stunning skyline</p>
            <p className="text-lg md:text-xl opacity-80 mt-2">Secure monthly bays from AED {minPrice}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search building or tower..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div></div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset filters
              </Button>
            </div>
          </div>

          {/* Price Slider and Availability */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Price: AED {priceRange[0]} - {priceRange[1]} / month
            </span>
            <div className="flex-1 max-w-xs">
              <Slider value={priceRange} onValueChange={setPriceRange} max={20000} min={0} step={100} className="w-full" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="available" checked={showAvailableOnly} onCheckedChange={checked => setShowAvailableOnly(checked === true)} />
              <label htmlFor="available" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show only available
              </label>
            </div>
          </div>
        </div>
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
          {filteredSpots.map(spot => <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {/* Full-width image */}
              <div className="relative w-full h-64">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                
                {/* Short description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {spot.description || "Secure underground parking space. 24/7 access, covered area."}
                </p>

                {/* Price prominently displayed */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                </div>

                {/* Optional feature tags */}
                {spot.specs && spot.specs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {spot.specs.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Reserve Now Button */}
                <Button 
                  onClick={() => handleReserveClick(spot)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                  Reserve Now
                </Button>
              </div>
            </Card>)}
        </div>
        )}

        {filteredSpots.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No parking spaces found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>}
      </div>
      
      <ParkingBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        parkingSpot={selectedSpot}
      />
      
      <Footer />
    </div>;
};
export default DubaiMarina;