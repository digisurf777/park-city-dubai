import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const locations = [
  {
    name: "Dubai Marina",
    link: "/zones/dubai-marina",
    image: "/assets/zones/dubai-marina.jpg"
  },
  {
    name: "Downtown",
    link: "/find-parking?district=downtown",
    image: "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.png"
  },
  {
    name: "Palm Jumeirah",
    link: "/find-parking?district=palm-jumeirah",
    image: "/lovable-uploads/atlantis-hotel-hero.jpg"
  },
  {
    name: "Business Bay",
    link: "/find-parking?district=business-bay",
    image: "/assets/zones/business-bay.jpg"
  },
  {
    name: "DIFC",
    link: "/find-parking?district=difc",
    image: "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.png"
  },
  {
    name: "Deira",
    link: "/find-parking?district=deira",
    image: "/assets/zones/deira.jpg"
  }
];

const PopularLocations = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            POPULAR PARKING LOCATIONS IN DUBAI
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {locations.map((location, index) => (
            <div 
              key={index} 
              className="animate-fade-in hover:transform hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative aspect-video">
                  <img 
                    src={location.image} 
                    alt={location.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-30"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 uppercase text-center">
                      {location.name}
                    </h3>
                    <Link to={location.link}>
                      <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation min-h-[44px]">
                        Select Zone
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;