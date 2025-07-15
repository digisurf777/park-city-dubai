import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { MapPin, Clock, Shield } from "lucide-react";

const featuredSpots = [
  {
    id: 1,
    title: "Downtown Dubai Premium Spot",
    location: "Near Burj Khalifa",
    price: 25,
    image: "/lovable-uploads/downtown-hero.jpg",
    rating: 4.9,
    reviews: 127,
    features: ["Covered", "24/7 Access", "CCTV"]
  },
  {
    id: 2,
    title: "Dubai Marina Waterfront",
    location: "Marina Walk",
    price: 22,
    image: "/lovable-uploads/dubai-marina-hero.jpg",
    rating: 4.8,
    reviews: 89,
    features: ["Valet", "Security", "Premium"]
  },
  {
    id: 3,
    title: "Business Bay Executive",
    location: "Business Bay Metro",
    price: 20,
    image: "/lovable-uploads/business-bay-hero.jpg",
    rating: 4.7,
    reviews: 156,
    features: ["Metro Access", "Covered", "Electric Charging"]
  }
];

const zones = [
  {
    name: "Downtown",
    count: "150+ spaces",
    image: "/lovable-uploads/downtown.jpg",
    link: "/zones/downtown"
  },
  {
    name: "Dubai Marina",
    count: "200+ spaces",
    image: "/lovable-uploads/dubai-marina.jpg",
    link: "/zones/dubai-marina"
  },
  {
    name: "Business Bay",
    count: "180+ spaces",
    image: "/lovable-uploads/business-bay.jpg",
    link: "/zones/business-bay"
  },
  {
    name: "DIFC",
    count: "120+ spaces",
    image: "/lovable-uploads/difc.jpg",
    link: "/zones/difc"
  },
  {
    name: "Palm Jumeirah",
    count: "80+ spaces",
    image: "/lovable-uploads/palm-jumeirah.jpg",
    link: "/zones/palm-jumeirah"
  },
  {
    name: "Deira",
    count: "300+ spaces",
    image: "/lovable-uploads/deira.jpg",
    link: "/zones/deira"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSpotClick = (spotId: number) => {
    navigate(`/product/${spotId}`);
  };

  const handleBookNow = (spotId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book a parking space.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/product/${spotId}`);
  };

  const handleZoneClick = (zoneLink: string) => {
    navigate(zoneLink);
  };

  return (
    <div className="min-h-screen bg-white animate-zoom-slow">
      <Navbar />
      <Hero />
      
      {/* Featured Parking Spots */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Parking Spots
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium parking spaces in Dubai's most sought-after locations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSpots.map((spot) => (
              <Card key={spot.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white border-0 shadow-lg overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={spot.image} 
                    alt={spot.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onClick={() => handleSpotClick(spot.id)}
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-white">AED {spot.price}/hr</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{spot.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{spot.location}</span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium ml-1">{spot.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({spot.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {spot.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleBookNow(spot.id)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Zone */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Browse Parking by Zone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find parking spaces in your preferred Dubai neighborhood
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <Card 
                key={zone.name} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-md overflow-hidden"
                onClick={() => handleZoneClick(zone.link)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={zone.image} 
                    alt={zone.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{zone.name}</h3>
                    <p className="text-sm opacity-90">{zone.count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Shazam Parking Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your parking space in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Spot</h3>
              <p className="text-gray-600">
                Browse available parking spaces in your desired location and choose the perfect spot for your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Instantly</h3>
              <p className="text-gray-600">
                Select your preferred time slot and duration, then confirm your booking with secure payment.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Park with Confidence</h3>
              <p className="text-gray-600">
                Enjoy your reserved spot with 24/7 support and guaranteed availability when you arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero CTA Banner - Matching Reference Style */}
      <section className="py-20 sm:py-28 lg:py-40 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 relative overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/90 via-emerald-500/95 to-teal-600/90"></div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          {/* Main Headline - Exact Match to Reference */}
          <div className="mb-11 sm:mb-14 ">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 sm:mb-8 text-5xl tracking-tight xl:text-7xl">Own a Parking Space?</h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 sm:mb-12 leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm text-6xl">
                Turn it into steady income.
              </span>
            </h2>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight font-light xl:text-5xl">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent text-6xl font-medium">
                Earn passive income.
              </span>
            </h3>
          </div>
          
          {/* CTA Button */}
          <div className="space-y-6 sm:space-y-8">
            <Link to="/rent-out-your-space">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-yellow-50 hover:text-emerald-700 px-10 sm:px-16 py-5 sm:py-7 text-xl sm:text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                Start Earning Today
              </Button>
            </Link>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-white/95 text-sm sm:text-base font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 text-lg">✓</span>
                Free to list
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 text-lg">✓</span>
                Earn up to AED 1,000/month
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 text-lg">✓</span>
                Secure payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Your Trusted Parking Platform
          </h2>
          <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">
            Shazam Parking Makes it Easy
          </h3>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Revolutionising parking in Dubai
          </p>
          <Link to="/about-us">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              About Us
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;