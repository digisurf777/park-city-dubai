import { MapPin, Calendar, Car, Shield, Clock, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Secure your parking space in Dubai with our simple, reliable process
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Browse Locations</h3>
              <p className="text-muted-foreground">
                Search by district, mall, or landmark to find available parking spaces in your desired area
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. Select Duration</h3>
              <p className="text-muted-foreground">
                Choose your rental period from 1 month to 12 months and enjoy automatic discounts for longer bookings
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Park & Enjoy</h3>
              <p className="text-muted-foreground">
                Receive your booking confirmation and park with confidence in your guaranteed space
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why Choose ShazamParking?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-lg text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4">Guaranteed Spots</h3>
              <p className="text-muted-foreground">
                Your parking space is reserved and guaranteed - no more circling around looking for parking
              </p>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-lg text-center">
              <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4">Fixed Pricing</h3>
              <p className="text-muted-foreground">
                No surge pricing or hidden fees. You know exactly what you'll pay upfront
              </p>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-lg text-center">
              <Clock className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-4">Save Time</h3>
              <p className="text-muted-foreground">
                Skip the search and drive straight to your reserved spot. More time for what matters
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;