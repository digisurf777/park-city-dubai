import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Listings = () => {
  const parkingSpaces = [
    { 
      id: 1, 
      name: "Downtown Parking Bay", 
      price: "500", 
      location: "Downtown Dubai", 
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      features: ["Covered", "24/7 Access", "Security"]
    },
    { 
      id: 2, 
      name: "DIFC Business Center", 
      price: "450", 
      location: "DIFC, Dubai", 
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      features: ["Valet Service", "Premium Location", "Executive Level"]
    },
    { 
      id: 3, 
      name: "Dubai Mall Premium", 
      price: "380", 
      location: "Downtown Dubai", 
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      features: ["Mall Access", "Climate Controlled", "CCTV"]
    },
    { 
      id: 4, 
      name: "Marina Walk Parking", 
      price: "420", 
      location: "Dubai Marina", 
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      features: ["Waterfront", "Walking Distance", "Secure"]
    },
    { 
      id: 5, 
      name: "Emirates Mall Valet", 
      price: "520", 
      location: "Al Barsha", 
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      features: ["Valet Parking", "Premium Service", "Direct Access"]
    },
    { 
      id: 6, 
      name: "JBR Beach Access", 
      price: "350", 
      location: "Jumeirah Beach", 
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      features: ["Beach Access", "Outdoor", "Tourist Area"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-20 pb-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Available Parking Spaces
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Browse our premium parking locations across Dubai
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by district, mall, or landmark..."
                  className="pl-10 h-12 text-lg border-border focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={space.image} 
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-card px-3 py-1 rounded text-sm font-semibold text-primary border border-border">
                    from AED {space.price}/month
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{space.name}</h3>
                  <p className="text-muted-foreground mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {space.location}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {space.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <Link to={`/listing/${space.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-border hover:bg-secondary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Listings;