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
import difcHero from "@/assets/zones/difc-real.jpg";

const DIFC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    console.log("Fetching parking spots for DIFC...");
    try {
      const { data, error } = await supabase
        .from("parking_listings")
        .select("*")
        .eq("zone", "DIFC")
        .eq("status", "approved");

      console.log("Supabase query result:", { data, error });

      if (error) throw error;

      const transformedData = data.map((spot) => ({
        id: spot.id,
        name: spot.title,
        district: "DIFC",
        price: spot.price_per_month || 0,
        image: "/lovable-uploads/645ad921-4efc-4172-858a-ce781e236f08.png",
        specs: spot.features || ["Access Card", "Covered", "2.1m Height"],
        available: true,
        address: spot.address,
        description: spot.description,
      }));

      console.log("Transformed data:", transformedData);

      if (transformedData.length === 0) {
        console.log("No data from database, using demo data");
        setParkingSpots([
          {
            id: 1,
            name: "Sky Gardens DIFC",
            district: "DIFC",
            price: 500,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Sky Gardens", "Premium", "24/7 Security"],
            available: true,
            address: "Sky Gardens DIFC, DIFC",
            description: "Premium parking space in Sky Gardens DIFC with 24/7 security and modern amenities."
          },
          {
            id: 2,
            name: "Index Tower",
            district: "DIFC",
            price: 750,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Premium Tower", "Basement", "Concierge"],
            available: true,
            address: "Index Tower, DIFC",
            description: "Basement parking in the highly sought-after Index Tower with 24-hour security, concierge, and easy elevator access."
          },
          {
            id: 3,
            name: "Burj Daman",
            district: "DIFC",
            price: 700,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Landmark", "Secure", "Premium"],
            available: true,
            address: "Burj Daman, DIFC",
            description: "Premium secure parking in the landmark Burj Daman tower with excellent DIFC access."
          },
          {
            id: 4,
            name: "Aspin Commercial Tower (3A-31)",
            district: "DIFC",
            price: 600,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Commercial", "Space 3A-31", "Secure"],
            available: true,
            address: "Aspin Commercial Tower, DIFC",
            description: "Space 3A-31 in Aspin Commercial Tower with secure access and professional amenities."
          },
          {
            id: 5,
            name: "Aspin Commercial Tower (5A-25)",
            district: "DIFC",
            price: 600,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Commercial", "Space 5A-25", "Secure"],
            available: true,
            address: "Aspin Commercial Tower, DIFC",
            description: "Space 5A-25 in Aspin Commercial Tower with secure parking and business district access."
          },
          {
            id: 6,
            name: "DAMAC Park Towers",
            district: "DIFC",
            price: 650,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["DAMAC Quality", "Space P2 088", "Secure"],
            available: true,
            address: "DAMAC Park Towers, DIFC",
            description: "Space P2 088 - Secure parking in DAMAC Park Towers with quality amenities and professional access."
          },
          {
            id: 7,
            name: "Sky Gardens DIFC (Ground Floor)",
            district: "DIFC",
            price: 650,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Ground Floor", "Exit Access", "Premium"],
            available: true,
            address: "Sky Gardens DIFC, DIFC",
            description: "Ground floor parking close to the exit in Sky Gardens DIFC with premium access and convenience."
          },
          {
            id: 8,
            name: "Limestone House 5F2",
            district: "DIFC",
            price: 550,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Space 2176", "Secured", "Covered"],
            available: true,
            address: "Limestone House, DIFC",
            description: "Space number 2176 - Secured covered parking space available for rent with professional access."
          }
        ]);
      } else {
        setParkingSpots(transformedData);
      }
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      setParkingSpots([
        {
          id: 1,
          name: "Sky Gardens DIFC",
          district: "DIFC",
          price: 500,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Sky Gardens", "Premium", "24/7 Security"],
          available: true,
          address: "Sky Gardens DIFC, DIFC",
          description: "Premium parking space in Sky Gardens DIFC with 24/7 security and modern amenities."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1500]);
    setShowAvailableOnly(false);
  };

  const filteredSpots = parkingSpots.filter((spot) => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const matchesAvailability = !showAvailableOnly || spot.available;
    return matchesSearch && matchesPrice && matchesAvailability;
  });

  const minPrice = parkingSpots.length > 0 ? Math.min(...parkingSpots.map((spot) => spot.price)) : 0;

  const handleReserveClick = (spot: any) => {
    setSelectedSpot(spot);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${difcHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in DIFC</h1>
            <p className="text-xl md:text-2xl opacity-90">Global financial hub with premium office towers</p>
            <p className="text-lg md:text-xl opacity-80 mt-2">Secure monthly bays from AED {minPrice}</p>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Price: AED {priceRange[0]} - {priceRange[1]} / month
            </span>
            <div className="flex-1 max-w-xs">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1500}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={showAvailableOnly}
                onCheckedChange={(checked) => setShowAvailableOnly(checked === true)}
              />
              <label htmlFor="available" className="text-sm font-medium leading-none">
                Show only available
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in DIFC`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
            {filteredSpots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative w-full h-64">
                  <img src="/lovable-uploads/645ad921-4efc-4172-858a-ce781e236f08.png" alt={spot.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{spot.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {spot.description || "Secure underground parking space. 24/7 access, covered area."}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary">From AED {spot.price}/month</span>
                  </div>

                  {spot.specs && spot.specs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {spot.specs.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mb-4 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Benefits:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Guaranteed parking space</li>
                      <li>• Fixed price - no increases during rental</li>
                      <li>• Priority customer support</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => handleReserveClick(spot)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reserve Now
                  </Button>
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
    </div>
  );
};

export default DIFC;