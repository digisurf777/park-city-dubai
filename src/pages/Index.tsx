import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, CreditCard, Car, DollarSign, Clock, Shield, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import dubaihero from "@/assets/dubai-skyline-hero.jpg";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import businessMan from "@/assets/business-man.jpg";
import phoneLogo from "@/assets/phone-logo.png";
import dubaiMarinaZone from "@/assets/zones/dubai-marina.jpg";
import downtownZone from "@/assets/zones/downtown.jpg";
import palmJumeirahZone from "@/assets/zones/palm-jumeirah.jpg";
import businessBayZone from "@/assets/zones/business-bay.jpg";
import difcZone from "@/assets/zones/difc.jpg";
import deiraZone from "@/assets/zones/deira.jpg";
const Index = () => {
  return <div className="min-h-screen bg-white animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat animate-fade-in" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png')`,
      backgroundSize: 'cover',
      animation: 'zoom-slow 20s ease-in-out infinite alternate'
    }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white animate-fade-in">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-16 lg:pt-0 my-0 mx-[2px] px-0 py-[141px]">
            {/* Left side - Text */}
            <div className="text-center lg:text-left lg:flex-1 mb-8 lg:mb-0">
              <h1 style={{
              textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)',
              fontWeight: '300'
            }} className="sm:text-4xl md:text-5xl lg:text-6xl mb-8 lg:mb-12 leading-tight px-4 lg:px-0 font-bold xl:text-6xl text-4xl text-left">
                YOUR TRUSTED PARKING PLATFORM IN DUBAI
              </h1>
            </div>
            
            {/* Right side - Phone Image */}
            <div className="lg:flex-1 flex justify-center lg:justify-end">
              <img alt="Shazam Parking Mobile App" className="w-64 sm:w-80 md:w-96 lg:max-w-md h-auto" src="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" />
            </div>
          </div>
          
          {/* CTA Button - Centered */}
          <div className="absolute bottom-10 sm:bottom-20 left-1/2 transform -translate-x-1/2 px-4">
            <Link to="/my-account">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto">
                LOGIN / SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Parking Locations */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              POPULAR PARKING LOCATIONS IN DUBAI
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[{
            name: "Dubai Marina",
            link: "/zones/dubai-marina",
            image: dubaiMarinaZone
          }, {
            name: "Downtown",
            link: "/find-parking?district=downtown",
            image: downtownZone
          }, {
            name: "Palm Jumeirah",
            link: "/find-parking?district=palm-jumeirah",
            image: palmJumeirahZone
          }, {
            name: "Business Bay",
            link: "/find-parking?district=business-bay",
            image: businessBayZone
          }, {
            name: "DIFC",
            link: "/find-parking?district=difc",
            image: difcZone
          }, {
            name: "Deira",
            link: "/find-parking?district=deira",
            image: deiraZone
          }].map((location, index) => <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative aspect-video">
                  <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity group-hover:bg-opacity-30"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 uppercase text-center">{location.name}</h3>
                    <Link to={location.link}>
                      <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold">
                        Select Zone
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Search & Select</h3>
              <p className="text-gray-600 text-sm sm:text-base px-4">
                Find the perfect parking location from our verified spaces
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CreditCard className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Book & Pay Securely</h3>
              <p className="text-gray-600 text-sm sm:text-base px-4">
                Reserve your spot instantly with secure online payment
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Car className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Park & Relax</h3>
              <p className="text-gray-600 text-sm sm:text-base px-4">
                Arrive at your destination with guaranteed parking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rent Out Your Space Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking to rent out your space?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold">
                SHAZAM PARKING IS HERE TO HELP YOU
              </p>
              <Link to="/rent-out-your-space">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  Rent Out a Space
                </Button>
              </Link>
            </div>
            <div className="order-first lg:order-last">
              <img src={luxuryCar} alt="Luxury car in Dubai" className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Find Parking Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src={dubaihero} alt="Dubai UAE skyline" className="w-full rounded-lg shadow-lg" />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking for a parking space?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold">
                FIND YOUR SPACE WITH SHAZAM PARKING
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
            <div className="text-center">
              <DollarSign className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Money</h3>
            </div>
            <div className="text-center">
              <Clock className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Time</h3>
            </div>
            <div className="text-center">
              <Shield className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Absolute Convenience</h3>
            </div>
          </div>

          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Why choose SHAZAM PARKING?
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </h3>
            <img src={businessMan} alt="Successful businessman" className="mx-auto rounded-lg shadow-lg max-w-2xl w-full" />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Rent a parking space in just 3 simple steps
            </h2>
          </div>
          <div className="flex justify-center">
            <img src="/lovable-uploads/d0df124f-405d-49cb-8c2d-b4ee6829cadf.png" alt="Three simple steps to rent parking" className="max-w-4xl w-full" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              What customers say about SHAZAM PARKING
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[{
            quote: "ShazamParking is a game-changer for anyone looking for a stress-free parking experience, it's easy to use, reliable and convenient.",
            name: "Aaliyah Armasi"
          }, {
            quote: "I highly recommend ShazamParking, it offers an easy-to-use platform, a wide range of parking options, and excellent customer service, making it the perfect parking solution.",
            name: "Ahmed Mohammed"
          }, {
            quote: "ShazamParking is my go-to platform for parking, it's user-friendly, reliable, and offers a wide range of options, making it convenient and easy to find a parking spot.",
            name: "Murtaza Hussain"
          }].map((testimonial, index) => <Card key={index} className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-6 sm:h-8 w-6 sm:w-8 text-primary mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Hero CTA Banner - Matching Reference Style */}
      <section className="py-20 sm:py-28 lg:py-40 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 relative overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/90 via-emerald-500/95 to-teal-600/90"></div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          {/* Main Headline - Exact Match to Reference */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 sm:mb-8 leading-[0.9] tracking-tight">
              Have an unused
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 sm:mb-12 leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
                parking bay?
              </span>
            </h2>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
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
    </div>;
};
export default Index;