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
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen">
            {/* Left side - Text */}
            <div className="text-left lg:flex-1">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-12 leading-tight" style={{
              textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)',
              fontWeight: '300'
            }}>
                YOUR TRUSTED PARKING PLATFORM IN DUBAI
              </h1>
            </div>
            
            {/* Right side - Phone Image */}
            <div className="lg:flex-1 flex justify-center lg:justify-end">
              <img src="/lovable-uploads/df7ee9c3-3bac-4642-b31e-a35557e4b211.png" alt="Shazam Parking Mobile App" className="max-w-md h-auto" />
            </div>
          </div>
          
          {/* CTA Button - Centered */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <Link to="/my-account">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-full">
                LOGIN / SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Parking Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              POPULAR PARKING LOCATIONS IN DUBAI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-4 uppercase text-center">{location.name}</h3>
                    <Link to={location.link}>
                      <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 text-lg font-semibold">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Search & Select</h3>
              <p className="text-gray-600">
                Find the perfect parking location from our verified spaces
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Book & Pay Securely</h3>
              <p className="text-gray-600">
                Reserve your spot instantly with secure online payment
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Park & Relax</h3>
              <p className="text-gray-600">
                Arrive at your destination with guaranteed parking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rent Out Your Space Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Are you looking to rent out your space?
              </h2>
              <p className="text-xl text-gray-600 mb-8 uppercase font-semibold">
                SHAZAM PARKING IS HERE TO HELP YOU
              </p>
              <Link to="/rent-out-your-space">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                  Rent Out a Space
                </Button>
              </Link>
            </div>
            <div>
              <img src={luxuryCar} alt="Luxury car in Dubai" className="w-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Find Parking Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src={dubaihero} alt="Dubai UAE skyline" className="w-full rounded-lg shadow-lg" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Are you looking for a parking space?
              </h2>
              <p className="text-xl text-gray-600 mb-8 uppercase font-semibold">
                FIND YOUR SPACE WITH SHAZAM PARKING
              </p>
              <Link to="/find-parking">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                  Book a Space
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <DollarSign className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Save Money</h3>
            </div>
            <div className="text-center">
              <Clock className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Save Time</h3>
            </div>
            <div className="text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Absolute Convenience</h3>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why choose SHAZAM PARKING?
            </h2>
            <h3 className="text-2xl text-gray-700 mb-8">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </h3>
            <img src={businessMan} alt="Successful businessman" className="mx-auto rounded-lg shadow-lg max-w-2xl w-full" />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Rent a parking space in just 3 simple steps
            </h2>
          </div>
          <div className="flex justify-center">
            <img src="/lovable-uploads/d0df124f-405d-49cb-8c2d-b4ee6829cadf.png" alt="Three simple steps to rent parking" className="max-w-4xl w-full" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What customers say about SHAZAM PARKING
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            quote: "ShazamParking is a game-changer for anyone looking for a stress-free parking experience, it's easy to use, reliable and convenient.",
            name: "Aaliyah Armasi"
          }, {
            quote: "I highly recommend ShazamParking, it offers an easy-to-use platform, a wide range of parking options, and excellent customer service, making it the perfect parking solution.",
            name: "Ahmed Mohammed"
          }, {
            quote: "ShazamParking is my go-to platform for parking, it's user-friendly, reliable, and offers a wide range of options, making it convenient and easy to find a parking spot.",
            name: "Murtaza Hussain"
          }].map((testimonial, index) => <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Enhanced Green CTA Banner */}
      <section className="py-32 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 relative overflow-hidden animate-fade-in">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)",
            backgroundSize: "50px 50px"
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-16 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Enhanced Heading */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight animate-scale-in">
              Have an unused<br />
              <span className="text-yellow-300 drop-shadow-lg">parking bay?</span><br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Earn passive income.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-2 font-medium">
              💰 Turn your empty space into monthly revenue
            </p>
            <p className="text-lg md:text-xl text-white/80">
              Join hundreds of space owners earning up to AED 1,000+ per month
            </p>
          </div>
          
          {/* Enhanced CTA Button */}
          <div className="space-y-6">
            <Link to="/rent-out-your-space">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-yellow-50 hover:text-primary/90 px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 animate-bounce-slow border-4 border-white/20"
              >
                🚗 List Your Space Now
              </Button>
            </Link>
            
            {/* Secondary Info */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/90 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Free to list
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Instant bookings
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Secure payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      

      {/* Final CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Trusted Parking Platform
          </h2>
          <h3 className="text-2xl text-gray-700 mb-8">
            Shazam Parking Makes it Easy
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Revolutionising parking in Dubai
          </p>
          <Link to="/about-us">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
              About Us
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;