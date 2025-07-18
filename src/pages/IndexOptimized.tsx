import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PerformantHero from "@/components/PerformantHero";
import PopularLocations from "@/components/PopularLocations";
import useSEO from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, CreditCard, Car, DollarSign, Clock, Shield, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import businessMan from "@/assets/business-man.jpg";
import phoneLogo from "@/assets/phone-logo.png";

const IndexOptimized = () => {
  const seoData = useSEO({
    title: "Shazam Parking - Dubai's Trusted Parking Platform",
    description: "Find and book parking spaces in Dubai Marina, Downtown, DIFC, Business Bay, Palm Jumeirah, and Deira. List your parking space and start earning monthly income with Dubai's most trusted parking platform.",
    keywords: "Dubai parking, parking space rental, Dubai Marina parking, Downtown Dubai parking, DIFC parking, Business Bay parking, Palm Jumeirah parking, Deira parking, secure parking Dubai, monthly parking income, rent parking space Dubai",
    url: "/"
  });

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

  const steps = [
    {
      icon: Search,
      title: "Search & Select",
      description: "Find the perfect parking location from our verified spaces"
    },
    {
      icon: CreditCard,
      title: "Book & Pay Securely",
      description: "Reserve your spot instantly with secure online payment"
    },
    {
      icon: Car,
      title: "Park & Relax",
      description: "Arrive at your destination with parking available"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {seoData}
      <Navbar />
      
      {/* Performance Optimized Hero */}
      <PerformantHero />

      {/* Popular Parking Locations */}
      <PopularLocations />

      {/* How It Works Strip - Simplified */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                icon: Search,
                title: "Search & Select",
                description: "Find the perfect parking location from our verified spaces"
              },
              {
                icon: CreditCard,
                title: "Book & Pay Securely",
                description: "Reserve your spot instantly with secure online payment"
              },
              {
                icon: Car,
                title: "Park & Relax",
                description: "Arrive at your destination with parking available"
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in hover:transform hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${0.3 + index * 0.2}s` }}
              >
                <div className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rent Out Your Space Section - Simplified */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking to rent out your space?
              </h2>
              <p className="text-base lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold sm:text-lg">
                ShazamParking IS HERE TO HELP YOU
              </p>
              <Link to="/rent-out-your-space">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-lg transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px]">
                  Rent Out a Space
                </Button>
              </Link>
            </div>
            <div className="order-first lg:order-last animate-fade-in">
              <img 
                src={luxuryCar} 
                alt="Luxury car in Dubai" 
                className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105" 
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ShazamParking Section - Simplified */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Why Choose ShazamParking?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: DollarSign,
                title: "Best Prices",
                description: "Competitive rates guaranteed"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Book anytime, anywhere"
              },
              {
                icon: Shield,
                title: "Secure & Safe",
                description: "Verified locations only"
              },
              {
                icon: Car,
                title: "Easy Booking",
                description: "Reserve in just a few taps"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Simplified */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "ShazamParking saved me so much time and money. Finding parking in Dubai Marina has never been easier!",
                author: "Ahmed K.",
                role: "Business Professional"
              },
              {
                quote: "I earn AED 800 monthly by listing my extra parking space. It's completely passive income!",
                author: "Sarah M.",
                role: "Property Owner"
              },
              {
                quote: "Secure, reliable, and always available. This app is a game-changer for Dubai residents.",
                author: "Mohamed R.",
                role: "Frequent User"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary mr-2" />
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              Join thousands of satisfied users in Dubai
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-white text-primary hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px]">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/find-a-parking-space">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px]">
                  Find Parking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexOptimized;