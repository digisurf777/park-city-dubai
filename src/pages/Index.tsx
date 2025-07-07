import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Car, Shield, DollarSign, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-primary">Parking Space</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Guaranteed parking • Fixed price • No surprises
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter district, mall, or landmark..."
                    className="h-12 text-lg border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold">
                  Search Parking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guaranteed Parking</h3>
              <p className="text-gray-600">Your space is reserved and waiting for you</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fixed Price</h3>
              <p className="text-gray-600">No surge pricing, no hidden fees</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">Skip the search, drive straight to your spot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Parking Spaces */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Parking Spaces
            </h2>
            <p className="text-lg text-gray-600">
              Prime locations with competitive monthly rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "DIFC Business Bay", price: "450", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "DIFC, Dubai" },
              { name: "Dubai Mall Premium", price: "380", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Downtown Dubai" },
              { name: "Marina Walk Parking", price: "420", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "Dubai Marina" },
              { name: "Emirates Mall Valet", price: "520", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Al Barsha" },
              { name: "JBR Beach Access", price: "350", image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", location: "Jumeirah Beach" },
              { name: "City Walk Central", price: "480", image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png", location: "Al Wasl" }
            ].map((space, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={space.image} 
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-sm font-semibold text-primary">
                    from AED {space.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{space.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {space.location}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Quick View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to secure your parking spot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Select Location</h3>
              <p className="text-gray-600">
                Choose your desired parking location from our extensive network across Dubai
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. Book Space</h3>
              <p className="text-gray-600">
                Reserve your parking spot instantly with our secure booking system
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Drive & Park</h3>
              <p className="text-gray-600">
                Arrive at your destination and park with confidence in your reserved spot
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose ShazamParking?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="backdrop-blur-md bg-white/80 border-white/20 p-8 text-center hover:shadow-xl transition-all duration-300">
              <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Save Money</h3>
              <p className="text-gray-600">
                Get the best parking rates in Dubai with up to 60% savings compared to street parking
              </p>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/80 border-white/20 p-8 text-center hover:shadow-xl transition-all duration-300">
              <Timer className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Save Time</h3>
              <p className="text-gray-600">
                No more circling around looking for parking. Your spot is guaranteed and waiting
              </p>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/80 border-white/20 p-8 text-center hover:shadow-xl transition-all duration-300">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Absolute Convenience</h3>
              <p className="text-gray-600">
                Book from anywhere, anytime. Manage your parking with our easy-to-use mobile app
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;