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
import difcHero from "@/assets/zones/difc.jpg";

const DIFC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const parkingSpots = [
    {
      id: 1,
      name: "Sky Gardens DIFC",
      district: "DIFC",
      price: 500,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
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
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Space 2176", "Secured", "Covered"],
      available: true,
      address: "Limestone House, DIFC",
      description: "Space number 2176 - Secured covered parking space available for rent with professional access."
    }
  ];

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

  const minPrice = Math.min(...parkingSpots.map(spot => spot.price));

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

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Available Parking Spaces</h2>
          <p className="text-muted-foreground">{filteredSpots.length} spaces found in DIFC</p>
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

export default DIFC;