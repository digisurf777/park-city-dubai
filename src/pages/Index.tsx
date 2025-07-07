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
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/lovable-uploads/161ee737-1491-45d6-a5e3-a642b7ff0806.png')`
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight">
            YOUR TRUSTED<br />
            PARKING<br />
            <span className="text-white">PLATFORM IN</span><br />
            <span className="text-white">DUBAI</span>
          </h1>
          
          <Link to="/my-account">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-full">
              LOGIN / SIGN UP
            </Button>
          </Link>
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
            {[
              { name: "Dubai Marina", link: "/find-parking?district=dubai-marina", image: dubaiMarinaZone },
              { name: "Downtown", link: "/find-parking?district=downtown", image: downtownZone },
              { name: "Palm Jumeirah", link: "/find-parking?district=palm-jumeirah", image: palmJumeirahZone },
              { name: "Business Bay", link: "/find-parking?district=business-bay", image: businessBayZone },
              { name: "DIFC", link: "/find-parking?district=difc", image: difcZone },
              { name: "Deira", link: "/find-parking?district=deira", image: deiraZone }
            ].map((location, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative aspect-video">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
              </Card>
            ))}
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
              <img 
                src={luxuryCar} 
                alt="Luxury car in Dubai"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Find Parking Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={dubaihero} 
                alt="Dubai UAE skyline"
                className="w-full rounded-lg shadow-lg"
              />
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
            <img 
              src={businessMan} 
              alt="Successful businessman"
              className="mx-auto rounded-lg shadow-lg max-w-2xl w-full"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <img 
                src={phoneLogo} 
                alt="Step 1"
                className="mx-auto mb-6 h-32"
              />
              <h3 className="text-2xl font-semibold mb-4">Select the location and duration</h3>
            </div>
            
            <div className="text-center">
              <img 
                src={phoneLogo} 
                alt="Step 2"
                className="mx-auto mb-6 h-32"
              />
              <h3 className="text-2xl font-semibold mb-4">Book Your Space</h3>
            </div>
            
            <div className="text-center">
              <img 
                src={phoneLogo} 
                alt="Step 3"
                className="mx-auto mb-6 h-32"
              />
              <h3 className="text-2xl font-semibold mb-4">Drive & Park</h3>
            </div>
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
            {[
              {
                quote: "ShazamParking is a game-changer for anyone looking for a stress-free parking experience, it's easy to use, reliable and convenient.",
                name: "Aaliyah Armasi"
              },
              {
                quote: "I highly recommend ShazamParking, it offers an easy-to-use platform, a wide range of parking options, and excellent customer service, making it the perfect parking solution.",
                name: "Ahmed Mohammed"
              },
              {
                quote: "ShazamParking is my go-to platform for parking, it's user-friendly, reliable, and offers a wide range of options, making it convenient and easy to find a parking spot.",
                name: "Murtaza Hussain"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Green CTA Banner */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Have an unused parking bay? Earn passive income.
          </h2>
          <Link to="/rent-out-your-space">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
              List Your Space
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">250+</h3>
              <p className="text-gray-600">Spaces Listed</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
              <p className="text-gray-600">Occupancy Rate</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">4.9★</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default Index;