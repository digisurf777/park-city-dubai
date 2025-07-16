import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, X, Car, CreditCard, Ruler } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import dubaiMarinaZone from "@/assets/zones/dubai-marina-real.jpg";
import downtownZone from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.png";
import palmJumeirahZone from "/lovable-uploads/atlantis-hotel-hero.jpg";
import businessBayZone from "@/assets/zones/business-bay-real.jpg";
import difcZone from "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.png";
import deiraZone from "@/assets/zones/deira-real.jpg";
const FindParking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const districtZones = [{
    name: "Dubai Marina",
    slug: "dubai-marina"
  }, {
    name: "Downtown",
    slug: "downtown"
  }, {
    name: "Palm Jumeirah",
    slug: "palm-jumeirah"
  }, {
    name: "Business Bay",
    slug: "business-bay"
  }, {
    name: "DIFC",
    slug: "difc"
  }, {
    name: "Deira",
    slug: "deira"
  }];

  // Fetch parking spots from database
  useEffect(() => {
    fetchParkingSpots();

    // Set up real-time subscription to parking_listings changes
    const channel = supabase.channel('parking-listings-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_listings'
    }, payload => {
      console.log('Real-time parking listing change:', payload);
      // Refetch data when any parking listing changes
      fetchParkingSpots();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      const district = districtZones.find(d => d.slug === districtParam);
      if (district) {
        setSelectedDistricts([district.name]);
        // Scroll to listings
        setTimeout(() => {
          const listingsSection = document.getElementById('listings-section');
          if (listingsSection) {
            listingsSection.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [searchParams]);
  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      console.log('Fetching parking spots from database...');
      const {
        data,
        error
      } = await supabase.from('parking_listings').select('*').eq('status', 'approved');
      console.log('Database query result:', {
        data,
        error,
        count: data?.length
      });
      if (error) {
        console.error('Error fetching parking spots:', error);
        return;
      }

      // Transform the data to match the UI format
      const transformedData = data?.map((listing: any) => {
        console.log('Processing listing:', listing.title, 'with images:', listing.images);
        return {
          id: listing.id,
          name: listing.title,
          district: listing.zone,
          price: listing.price_per_month || Math.round(listing.price_per_hour * 24 * 30),
          image: listing.images && listing.images.length > 0 ? listing.images[0] : "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          images: listing.images || [],
          specs: listing.features || ["Access Card", "Secure"],
          available: listing.status === 'approved'
        };
      }) || [];
      console.log('Transformed data:', transformedData);
      setParkingSpots(transformedData);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    } finally {
      setLoading(false);
    }
  };
  const districts = ["Palm Jumeirah", "Dubai Marina", "Downtown", "DIFC", "Business Bay", "JLT", "Barsha Heights", "Deira"];
  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]);
  };
  const handleSelectZone = (districtSlug: string) => {
    // Navigate to dedicated zone page
    window.location.href = `/zones/${districtSlug}`;
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDistricts([]);
    setPriceRange([0, 1500]);
    setShowAvailableOnly(false);
    // Clear URL parameters
    setSearchParams(new URLSearchParams());
  };
  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || spot.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(spot.district);
    const matchesPrice = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const matchesAvailability = !showAvailableOnly || spot.available;
    return matchesSearch && matchesDistrict && matchesPrice && matchesAvailability;
  });
  return <div className="min-h-screen bg-background animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-cover bg-bottom" style={{
        backgroundImage: 'url("/lovable-uploads/atlantis-hotel-hero.jpg")'
      }}></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </h1>
            <p className="text-lg md:text-xl opacity-90">Browse secure monthly bays across Dubai</p>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        
      </div>

      {/* District Selector Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Zone</h2>
          <p className="text-muted-foreground text-lg">Select a zone to find parking spaces in that area</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {districtZones.map(zone => {
          const zoneImages = {
            'dubai-marina': dubaiMarinaZone,
            'downtown': downtownZone,
            'palm-jumeirah': palmJumeirahZone,
            'business-bay': businessBayZone,
            'difc': difcZone,
            'deira': deiraZone
          };
          return <div key={zone.slug} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Zone Image */}
                <div className="relative h-64 overflow-hidden">
                  <img src={zoneImages[zone.slug as keyof typeof zoneImages]} alt={zone.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/30"></div>
                  
                  {/* Zone Title Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white text-center px-4">
                      {zone.name}
                    </h3>
                  </div>
                </div>
                
                {/* Select Zone Button */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Button onClick={() => handleSelectZone(zone.slug)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                    Select zone
                  </Button>
                </div>
              </div>;
        })}
        </div>

        {/* Parking Listings Section */}
        {loading ? <div id="listings-section" className="mt-16 text-center">
            <p className="text-muted-foreground">Loading parking spots...</p>
          </div> : filteredSpots.length > 0 ? <div id="listings-section" className="mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Available Parking Spots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.map(spot => <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image carousel */}
                  <div className="relative h-48 overflow-hidden">
                    {spot.images && spot.images.length > 0 ? <div className="flex transition-transform duration-300 ease-in-out h-full">
                        <img src={spot.images[0]} alt={spot.name} className="w-full h-full object-cover flex-shrink-0" />
                      </div> : <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />}
                    {spot.images && spot.images.length > 1 && <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        +{spot.images.length - 1} more
                      </div>}
                    {spot.available ? <Badge className="absolute top-2 right-2 bg-green-500">Available</Badge> : <Badge className="absolute top-2 right-2 bg-red-500">Unavailable</Badge>}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{spot.name}</h4>
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{spot.district}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-primary">
                        AED {spot.price}
                        <span className="text-sm text-muted-foreground font-normal">/month</span>
                      </div>
                      <Button size="sm" disabled={!spot.available} className={cn(spot.available ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                        {spot.available ? "Reserve" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </Card>)}
            </div>
          </div> : <div id="listings-section" className="mt-16 text-center">
            <p className="text-muted-foreground">No parking spots found matching your criteria.</p>
          </div>}
      </div>

      <Footer />
    </div>;
};
export default FindParking;