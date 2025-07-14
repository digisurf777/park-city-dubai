import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Car, CreditCard, Ruler } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import businessBayHero from "@/assets/zones/business-bay.jpg";

const BusinessBay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const parkingSpots = [
    {
      id: 1,
      name: "Zada Tower",
      district: "Business Bay",
      price: 4000,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["DAMAC Premium", "24/7 Access", "Covered"],
      available: true,
      address: "Tower A, DAMAC Towers by Paramount, Business Bay",
      description: "Secure and covered parking space in DAMAC Towers with 24/7 access for ultimate convenience."
    }
  ];

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

  const minPrice = Math.min(...parkingSpots.map(spot => spot.price));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0 bg-black/35"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${businessBayHero})` }}
        ></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Parking Spaces in Business Bay</h1>
            <p className="text-xl md:text-2xl opacity-90">Secure monthly bays from AED {minPrice}</p>
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
                placeholder="Search building..."
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
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={5000}
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

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
          <p className="text-muted-foreground">{filteredSpots.length} spaces found in Business Bay</p>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {/* Image */}
              <div className="relative aspect-video">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  From AED {spot.price} / month
                </Badge>
                {!spot.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Not Available</Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-1">{spot.name}</h3>
                <p className="text-muted-foreground mb-4">{spot.district}</p>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    <span>{spot.specs[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span>{spot.specs[1]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{spot.specs[2]}</span>
                  </div>
                </div>

                {/* Reserve Button */}
                {spot.available ? (
                  <Link to={`/parking/${spot.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Reserve
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
                    Not Available
                  </Button>
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
    </div>
  );
};

export default BusinessBay;