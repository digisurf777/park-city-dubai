import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedSpaces = () => {
  const featuredSpaces = [
    { name: "DIFC Business Bay", price: "450", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "DIFC, Dubai" },
    { name: "Dubai Mall Premium", price: "380", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Downtown Dubai" },
    { name: "Marina Walk Parking", price: "420", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "Dubai Marina" },
    { name: "Emirates Mall Valet", price: "520", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Al Barsha" },
    { name: "JBR Beach Access", price: "350", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "Jumeirah Beach" },
    { name: "City Walk Central", price: "480", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Al Wasl" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Featured Parking Spaces
          </h2>
          <p className="text-lg text-muted-foreground">
            Prime locations with competitive monthly rates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSpaces.map((space, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow border-border">
              <div className="aspect-video bg-muted relative">
                <img 
                  src={space.image} 
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-card px-2 py-1 rounded text-sm font-semibold text-primary border border-border">
                  from AED {space.price}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{space.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {space.location}
                </p>
                <Link to={`/listing/${index + 1}`}>
                  <Button variant="outline" size="sm" className="w-full border-border hover:bg-secondary">
                    Quick View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpaces;