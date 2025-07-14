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
import businessBayHero from "@/assets/zones/business-bay-real.jpg";

const BusinessBay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchParkingSpots();

    // Set up real-time subscription to parking_listings changes
    const channel = supabase
      .channel('parking-listings-business-bay')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_listings'
        },
        (payload) => {
          console.log('Real-time parking listing change in Business Bay:', payload);
          // Refetch data when any parking listing changes
          fetchParkingSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchParkingSpots = async () => {
    console.log("Fetching parking spots for Business Bay...");
    try {
      const { data, error } = await supabase
        .from("parking_listings")
        .select("*")
        .eq("zone", "Business Bay")
        .eq("status", "approved");

      console.log("Supabase query result:", { data, error });

      if (error) throw error;

      const transformedData = data.map((spot) => ({
        id: spot.id,
        name: spot.title,
        district: "Business Bay",
        price: spot.price_per_month || 0,
        image: spot.images && spot.images.length > 0 ? spot.images[0] : "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
        images: spot.images || [],
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
            name: "Zada Tower",
            district: "Business Bay",
            price: 4000,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Premium", "Ultra Luxury", "24/7 Security"],
            available: true,
            address: "Zada Tower, Business Bay",
            description: "Ultra-premium parking space in the luxury Zada Tower with top-tier amenities and 24/7 security."
          },
          {
            id: 2,
            name: "Millenium Binghatti Residence",
            district: "Business Bay",
            price: 1000,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Residential", "Modern", "Secure"],
            available: true,
            address: "Millenium Binghatti Residence, Business Bay",
            description: "Modern residential parking in Millenium Binghatti with secure access and contemporary amenities."
          },
          {
            id: 3,
            name: "Reva Residence DAMAC",
            district: "Business Bay",
            price: 600,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["DAMAC Quality", "Covered", "24/7"],
            available: true,
            address: "Reva Residence DAMAC, Business Bay",
            description: "Quality DAMAC parking with covered spaces and 24/7 access in the heart of Business Bay."
          },
          {
            id: 4,
            name: "Bellevue Towers",
            district: "Business Bay",
            price: 950,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Space 24", "Secured", "Covered"],
            available: true,
            address: "Bellevue Towers, Business Bay",
            description: "Space 24 - Secured covered parking space available for rent with accessible 24/7 access."
          },
          {
            id: 5,
            name: "SOL Avenue",
            district: "Business Bay",
            price: 900,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["Secure", "Covered", "Concierge"],
            available: true,
            address: "SOL Avenue, Business Bay",
            description: "Secure and covered parking with 24-hour security and concierge services providing added protection."
          },
          {
            id: 6,
            name: "Tower A DAMAC Towers by Paramount",
            district: "Business Bay",
            price: 1000,
            image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
            specs: ["DAMAC Premium", "24/7 Access", "Covered"],
            available: true,
            address: "Tower A, DAMAC Towers by Paramount, Business Bay",
            description: "Secure and covered parking space in DAMAC Towers with 24/7 access for ultimate convenience."
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
          name: "Zada Tower",
          district: "Business Bay",
          price: 4000,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          specs: ["Premium", "Ultra Luxury", "24/7 Security"],
          available: true,
          address: "Zada Tower, Business Bay",
          description: "Ultra-premium parking space in the luxury Zada Tower with top-tier amenities and 24/7 security."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 5000]);
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
          style={{ backgroundImage: `url(${businessBayHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in Business Bay</h1>
            <p className="text-xl md:text-2xl opacity-90">Central business district with modern skyscrapers</p>
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
                max={5000}
                min={0}
                step={100}
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
            {loading ? "Loading..." : `${filteredSpots.length} spaces found in Business Bay`}
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
                {/* Image carousel */}
                <div className="relative w-full h-64 overflow-hidden">
                  {spot.images && spot.images.length > 0 ? (
                    <div className="flex transition-transform duration-300 ease-in-out h-full">
                      <img 
                        src={spot.images[0]} 
                        alt={spot.name} 
                        className="w-full h-full object-cover flex-shrink-0"
                      />
                    </div>
                  ) : (
                    <img 
                      src={spot.image} 
                      alt={spot.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {spot.images && spot.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      +{spot.images.length - 1} more
                    </div>
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

export default BusinessBay;