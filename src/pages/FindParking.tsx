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
import dubaiMarinaZone from "@/assets/zones/dubai-marina.jpg";
import downtownZone from "@/assets/zones/downtown.jpg";
import palmJumeirahZone from "@/assets/zones/palm-jumeirah.jpg";
import businessBayZone from "@/assets/zones/business-bay.jpg";
import difcZone from "@/assets/zones/difc.jpg";
import deiraZone from "@/assets/zones/deira.jpg";

const FindParking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const districtZones = [
    { name: "Dubai Marina", slug: "dubai-marina" },
    { name: "Downtown", slug: "downtown" },
    { name: "Palm Jumeirah", slug: "palm-jumeirah" },
    { name: "Business Bay", slug: "business-bay" },
    { name: "DIFC", slug: "difc" },
    { name: "Deira", slug: "deira" }
  ];

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
            listingsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [searchParams]);

  const districts = [
    "Palm Jumeirah", "Dubai Marina", "Downtown", "DIFC", 
    "Business Bay", "JLT", "Barsha Heights", "Deira"
  ];

  const parkingSpots = [
    {
      id: 1,
      name: "Marina Gate Parking",
      district: "Dubai Marina",
      price: 450,
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      specs: ["Compact Size", "Access Card", "2.1m Height"],
      available: true
    },
    {
      id: 2,
      name: "DIFC Gate Village Bay",
      district: "DIFC",
      price: 650,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Large Size", "Remote Access", "3.0m Height"],
      available: true
    },
    {
      id: 3,
      name: "Downtown Boulevard Space",
      district: "Downtown",
      price: 380,
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      specs: ["Medium Size", "Access Card", "2.5m Height"],
      available: false
    },
    {
      id: 4,
      name: "Business Bay Tower Bay",
      district: "Business Bay",
      price: 520,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Large Size", "Remote Access", "2.8m Height"],
      available: true
    },
    {
      id: 5,
      name: "JLT Cluster Bay",
      district: "JLT",
      price: 420,
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      specs: ["Compact Size", "Access Card", "2.2m Height"],
      available: true
    },
    {
      id: 6,
      name: "Palm Jumeirah Villa Bay",
      district: "Palm Jumeirah",
      price: 750,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Premium Size", "Remote Access", "3.5m Height"],
      available: true
    }
  ];

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleSelectZone = (districtSlug: string) => {
    const district = districtZones.find(d => d.slug === districtSlug);
    if (district) {
      setSelectedDistricts([district.name]);
      // Update URL parameters
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('district', districtSlug);
      setSearchParams(newSearchParams);
      
      // Scroll to listings
      setTimeout(() => {
        const listingsSection = document.getElementById('listings-section');
        if (listingsSection) {
          listingsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
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
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(spot.district);
    const matchesPrice = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const matchesAvailability = !showAvailableOnly || spot.available;
    
    return matchesSearch && matchesDistrict && matchesPrice && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-bottom"
          style={{
            backgroundImage: 'url("/lovable-uploads/fa1ebb65-a439-4ecf-902a-16d18fc92f16.png")'
          }}
        ></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search building, tower or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* District Pills */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                {districts.map((district) => (
                  <Badge
                    key={district}
                    variant={selectedDistricts.includes(district) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedDistricts.includes(district) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => toggleDistrict(district)}
                  >
                    {district}
                    {selectedDistricts.includes(district) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset filters
              </Button>
            </div>
          </div>

          {/* Price Slider */}
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
              <label
                htmlFor="available"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only available
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* District Selector Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Zone</h2>
          <p className="text-muted-foreground text-lg">Select a zone to find parking spaces in that area</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {districtZones.map((zone) => {
            const zoneImages = {
              'dubai-marina': dubaiMarinaZone,
              'downtown': downtownZone, 
              'palm-jumeirah': palmJumeirahZone,
              'business-bay': businessBayZone,
              'difc': difcZone,
              'deira': deiraZone
            };
            
            return (
              <div key={zone.slug} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Zone Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={zoneImages[zone.slug as keyof typeof zoneImages]}
                    alt={zone.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                  <Button
                    onClick={() => handleSelectZone(zone.slug)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Select zone
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindParking;