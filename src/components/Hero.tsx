
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Car } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2316B79D" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Content */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Perfect Parking
            <span className="block text-primary">Anywhere in Dubai</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book secure parking spaces instantly. Save time, money, and hassle with Dubai's most trusted parking platform.
          </p>
        </div>

        {/* Search Card */}
        <Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-2xl p-8 mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </label>
              <Input
                placeholder="Enter area or landmark"
                className="border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date
              </label>
              <Input
                type="date"
                className="border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duration
              </label>
              <select className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary focus:outline-none">
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
              <select className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md focus:border-primary focus:ring-primary focus:outline-none">
                <option>Any</option>
                <option>Covered</option>
                <option>Open</option>
                <option>Valet</option>
              </select>
            </div>
          </div>
          <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-12 py-3 text-lg font-semibold">
            Find Parking Spots
          </Button>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-6 hover:bg-white/70 transition-all duration-300">
            <div className="text-primary text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
            <p className="text-gray-600">Reserve your spot in seconds with real-time availability</p>
          </Card>
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-6 hover:bg-white/70 transition-all duration-300">
            <div className="text-primary text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Save up to 60% compared to traditional parking</p>
          </Card>
          <Card className="backdrop-blur-md bg-white/60 border-white/20 p-6 hover:bg-white/70 transition-all duration-300">
            <div className="text-primary text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
            <p className="text-gray-600">All locations verified and monitored for your safety</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
