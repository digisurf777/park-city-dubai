import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Car, Shield, DollarSign, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/src/assets/parking-lot-aerial.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          {/* Left Side - Text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              YOUR TRUSTED<br />
              PARKING PLATFORM<br />
              IN <span className="text-primary">DUBAI</span>
            </h1>
            
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-12 py-6 text-xl font-semibold rounded-full"
            >
              LOGIN / SIGN UP
            </Button>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="hidden lg:flex flex-1 justify-center items-center">
            <div className="relative">
              <div className="w-80 h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Status Bar */}
                  <div className="bg-gray-100 h-8 flex items-center justify-between px-4 text-xs">
                    <span className="font-semibold">9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
                      <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Interface */}
                  <div className="p-4 bg-gradient-to-b from-primary/10 to-white h-full">
                    <div className="text-center mb-6">
                      <img 
                        src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png" 
                        alt="Shazam Parking" 
                        className="h-12 mx-auto mb-4"
                      />
                      <h2 className="text-lg font-bold text-gray-800">Find Parking</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="text-sm text-gray-600">Dubai Mall</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="text-sm text-gray-600">Today, 2:30 PM</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-primary text-white">
                        Find Parking
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2 mt-6">
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600">Hourly Rate</div>
                          <div className="font-bold text-primary">AED 15</div>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-600">Available</div>
                          <div className="font-bold text-green-600">24/7</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Popular Parking Locations in Dubai
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most sought-after parking spots across Dubai's prime locations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Dubai Mall", spots: "2,500+", price: "AED 15/hr" },
              { name: "Mall of the Emirates", spots: "1,800+", price: "AED 12/hr" },
              { name: "Dubai Marina", spots: "3,200+", price: "AED 20/hr" },
              { name: "Downtown Dubai", spots: "4,100+", price: "AED 25/hr" },
              { name: "Business Bay", spots: "2,900+", price: "AED 18/hr" },
              { name: "Jumeirah Beach", spots: "1,500+", price: "AED 22/hr" }
            ].map((location, index) => (
              <Card key={index} className="backdrop-blur-md bg-white/80 border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{location.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>{location.spots} spots</span>
                    <span className="font-semibold text-primary">{location.price}</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Parking
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

      
    </div>
  );
};

export default Index;