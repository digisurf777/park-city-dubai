import { MapPin, Calendar, Car } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple steps to secure your parking spot
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">1. Select Location</h3>
            <p className="text-muted-foreground">
              Choose your desired parking location from our extensive network across Dubai
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">2. Book Space</h3>
            <p className="text-muted-foreground">
              Reserve your parking spot instantly with our secure booking system
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">3. Drive & Park</h3>
            <p className="text-muted-foreground">
              Arrive at your destination and park with confidence in your reserved spot
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;