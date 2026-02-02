import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, CreditCard, Car, DollarSign, Clock, Shield, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { Link } from "react-router-dom";
import useSEO from "@/hooks/useSEO";
import secureParking from "@/assets/secure-parking-hero.jpg";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import dubaihero from "@/assets/dubai-skyline-hero.jpg";
import businessMan from "@/assets/business-man.jpg";
import dubaiMarinaZone from "@/assets/zones/dubai-marina.jpg";
import downtownZone from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.png";
import palmJumeirahZone from "/lovable-uploads/atlantis-hotel-hero.jpg";
import businessBayZone from "@/assets/zones/business-bay.jpg";
import difcZone from "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.png";
import deiraZone from "@/assets/zones/deira.jpg";

// Memoized location card for better performance
const LocationCard = memo(({ location, index }: { location: { name: string; link: string; image: string }; index: number }) => (
  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
    <div className="relative aspect-video">
      <img 
        src={location.image} 
        alt={`Monthly parking spaces in ${location.name}, Dubai`} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        loading="lazy" 
        decoding="async"
        width="400"
        height="225"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-30"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 uppercase text-center">
          {location.name}
        </h3>
        <Link to={location.link}>
          <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105">
            Select Zone
          </Button>
        </Link>
      </div>
    </div>
  </Card>
));
LocationCard.displayName = 'LocationCard';

// Memoized step card
const StepCard = memo(({ step, index }: { step: { icon: any; title: string; description: string }; index: number }) => (
  <div className="text-center animate-fade-in" style={{ animationDelay: `${300 + index * 150}ms` }}>
    <div className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-transform duration-300 hover:scale-110">
      <step.icon className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
    </div>
    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">
      {step.title}
    </h3>
    <p className="text-gray-600 text-sm sm:text-base px-4">
      {step.description}
    </p>
  </div>
));
StepCard.displayName = 'StepCard';

const Index = () => {
  const seoData = useSEO({
    title: "Shazam Parking - Dubai's Trusted Parking Platform",
    description: "Find and book parking spaces in Dubai Marina, Downtown, DIFC, Business Bay, Palm Jumeirah, and Deira. List your parking space and start earning monthly income with Dubai's most trusted parking platform.",
    keywords: "Dubai parking, parking space rental, Dubai Marina parking, Downtown Dubai parking, DIFC parking, Business Bay parking, Palm Jumeirah parking, Deira parking, secure parking Dubai, monthly parking income, rent parking space Dubai",
    url: "/"
  });

  const locations = [
    { name: "Dubai Marina", link: "/zones/dubai-marina", image: dubaiMarinaZone },
    { name: "Downtown", link: "/find-parking?district=downtown", image: downtownZone },
    { name: "Palm Jumeirah", link: "/find-parking?district=palm-jumeirah", image: palmJumeirahZone },
    { name: "Business Bay", link: "/find-parking?district=business-bay", image: businessBayZone },
    { name: "DIFC", link: "/find-parking?district=difc", image: difcZone },
    { name: "Deira", link: "/find-parking?district=deira", image: deiraZone }
  ];

  const steps = [
    { icon: Search, title: "Search & Select", description: "Find the perfect parking location from our verified spaces" },
    { icon: CreditCard, title: "Book & Pay Securely", description: "Reserve your spot instantly with secure online payment" },
    { icon: Car, title: "Park & Relax", description: "Arrive at your destination with parking available" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {seoData}
      <Navbar />
      
      {/* Email Confirmation Banner */}
      <div className="relative">
        <div className="px-4 pt-2">
          <div className="max-w-7xl mx-auto">
            <EmailConfirmationBanner />
          </div>
        </div>
      </div>
      
      {/* Hero Section - CSS animations for better performance */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${secureParking})`,
          backgroundSize: 'cover'
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-20 sm:pt-24 lg:pt-0 py-8 sm:py-16 lg:py-[141px]">
            {/* Left side - Text */}
            <div className="text-center lg:text-left lg:flex-1 mb-8 lg:mb-0 mt-8 sm:mt-16 lg:mt-0 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight px-2 lg:px-0 mb-4">
                <span className="block text-white" style={{ textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)' }}>
                  YOUR TRUSTED
                </span>
                <span className="block text-primary font-black" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)' }}>
                  PARKING PLATFORM
                </span>
                <span className="block text-white" style={{ textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)' }}>
                  IN DUBAI
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mt-4 px-2 lg:px-0" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)' }}>
                List your parking space in minutes and start earning every month.
              </p>
            </div>
            
            {/* Right side - Phone Image */}
            <div className="lg:flex-1 flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '200ms' }}>
              <picture>
                <source media="(max-width: 640px)" srcSet="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" type="image/webp" width="256" height="467" />
                <source media="(max-width: 1024px)" srcSet="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" type="image/webp" width="320" height="583" />
                <img 
                  alt="Shazam Parking Mobile App" 
                  className="w-64 sm:w-80 md:w-96 lg:max-w-md h-auto transition-transform duration-300 hover:scale-105" 
                  src="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" 
                  loading="eager" 
                  fetchPriority="high"
                  decoding="async" 
                  width="384" 
                  height="700"
                />
              </picture>
            </div>
          </div>
          
          {/* CTA Button - Centered */}
          <div className="flex justify-center mt-8 sm:mt-12 lg:absolute lg:bottom-20 lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link to="/my-account">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto shadow-lg transition-all duration-300 hover:scale-105">
                LOGIN / SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Parking Locations - CSS animations */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              POPULAR PARKING LOCATIONS IN DUBAI
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {locations.map((location, index) => (
              <LocationCard key={location.name} location={location} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Strip - CSS animations */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Rent Out Your Space Section */}
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
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-lg transition-all duration-300 hover:scale-105">
                  List Your Space
                </Button>
              </Link>
            </div>
            <div className="order-first lg:order-last animate-fade-in" style={{ animationDelay: '200ms' }}>
              <img 
                src={luxuryCar} 
                alt="Luxury car in Dubai" 
                className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105" 
                loading="lazy" 
                decoding="async"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Find Parking Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={dubaihero} 
                alt="Dubai UAE skyline" 
                className="w-full rounded-lg shadow-lg" 
                loading="lazy" 
                decoding="async"
                width="600"
                height="400"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking for a parking space?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold">
                FIND YOUR SPACE WITH ShazamParking
              </p>
              <Link to="/find-parking">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  Book a Space
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center animate-fade-in">
              <DollarSign className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Money</h3>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Clock className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Time</h3>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Shield className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Stay Secure</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Quote className="h-12 w-12 text-primary mx-auto mb-6" />
            <blockquote className="text-xl sm:text-2xl lg:text-3xl text-gray-700 italic mb-6">
              "Shazam Parking made it incredibly easy to find a secure monthly parking spot near my office. The whole process was seamless!"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <img 
                src={businessMan} 
                alt="Ahmed, Business Bay tenant" 
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
                decoding="async"
                width="64"
                height="64"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Ahmed</p>
                <p className="text-gray-600 text-sm">Business Bay tenant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;