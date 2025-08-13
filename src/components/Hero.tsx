
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Car } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-primary pt-16">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Content */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight animate-fade-in">
            <span className="block animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Have an unused Parking Bay?
            </span>
          </h1>
          <h2 className="text-3xl md:text-5xl font-black text-yellow-400 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Earn passive income.
          </h2>
          <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Start Earning Today
          </Button>
          
          {/* Feature Points */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-white animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <span className="text-lg font-medium">Free to list</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <span className="text-lg font-medium">Earn up to AED 1,000/month</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <span className="text-lg font-medium">Secure payments</span>
            </div>
          </div>
        </div>

        {/* Search Card - Mobile Optimized */}
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </label>
              <Input
                placeholder="Enter area or landmark"
                className="border-gray-200 focus:border-primary focus:ring-primary min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date
              </label>
              <Input
                type="date"
                className="border-gray-200 focus:border-primary focus:ring-primary min-h-[44px] text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duration
              </label>
              <select className="w-full min-h-[44px] px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary focus:outline-none text-base">
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
                <option>8 hours</option>
                <option>24 hours</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Type
              </label>
              <select className="w-full min-h-[44px] px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary focus:outline-none text-base">
                <option>Any</option>
                <option>Covered</option>
                <option>Open</option>
                <option>Valet</option>
              </select>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white px-6 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold min-h-[48px] touch-manipulation">
            Find Parking Spots
          </Button>
        </Card>

        {/* Feature Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-4 sm:p-6 hover:bg-white/70 transition-all duration-300 touch-manipulation">
            <div className="text-primary text-3xl sm:text-4xl mb-3 sm:mb-4">🚗</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Instant Booking</h3>
            <p className="text-gray-600 text-sm sm:text-base">Reserve your spot in seconds with real-time availability</p>
          </Card>
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-4 sm:p-6 hover:bg-white/70 transition-all duration-300 touch-manipulation">
            <div className="text-primary text-3xl sm:text-4xl mb-3 sm:mb-4">💰</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600 text-sm sm:text-base">Save up to 60% compared to traditional parking</p>
          </Card>
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-4 sm:p-6 hover:bg-white/70 transition-all duration-300 touch-manipulation sm:col-span-2 lg:col-span-1">
            <div className="text-primary text-3xl sm:text-4xl mb-3 sm:mb-4">🔒</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure & Safe</h3>
            <p className="text-gray-600 text-sm sm:text-base">All locations verified and monitored for your safety</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
