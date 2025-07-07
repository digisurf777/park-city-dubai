import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, Clock, Car, Star, ChevronLeft, ChevronRight, Shield, DollarSign, Headphones } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const FindParking = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});
  const [selectedDuration, setSelectedDuration] = useState<{[key: number]: string}>({});
  const [startDate, setStartDate] = useState<{[key: number]: Date}>({});

  const parkingSpots = [
    {
      id: 1,
      name: "DIFC Business Bay",
      rating: 4.6,
      price: 450,
      images: ["/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png", "/src/assets/indoor-parking.jpg", "/src/assets/valet-parking.jpg"],
      location: "DIFC, Dubai",
      type: "Outdoor",
      availability: "Available 24/7"
    },
    {
      id: 2,
      name: "Dubai Mall Premium",
      rating: 4.8,
      price: 300,
      images: ["/src/assets/indoor-parking.jpg", "/src/assets/outdoor-parking.jpg", "/src/assets/valet-parking.jpg"],
      location: "Downtown Dubai",
      type: "Indoor",
      availability: "Available 24/7"
    },
    {
      id: 3,
      name: "Marina Walk Parking",
      rating: 4.5,
      price: 380,
      images: ["/src/assets/outdoor-parking.jpg", "/src/assets/indoor-parking.jpg", "/src/assets/valet-parking.jpg"],
      location: "Dubai Marina",
      type: "Outdoor",
      availability: "6 AM - 12 AM"
    },
    {
      id: 4,
      name: "Mall of Emirates Valet",
      rating: 4.7,
      price: 520,
      images: ["/src/assets/valet-parking.jpg", "/src/assets/indoor-parking.jpg", "/src/assets/outdoor-parking.jpg"],
      location: "Al Barsha",
      type: "Valet",
      availability: "Available 24/7"
    }
  ];

  const getDurationOptions = (basePrice: number) => [
    { label: "1 Month", price: basePrice, discount: null },
    { label: "3 Months", price: basePrice, discount: "5% OFF" },
    { label: "6 Months", price: basePrice, discount: "10% OFF" },
    { label: "12 Months", price: basePrice, discount: "15% OFF" }
  ];

  const calculateDiscountedPrice = (basePrice: number, discount: string | null) => {
    if (!discount) return basePrice;
    const discountPercent = parseInt(discount.replace('% OFF', ''));
    return Math.round(basePrice * (100 - discountPercent) / 100);
  };

  const nextImage = (spotId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (spotId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [spotId]: ((prev[spotId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header */}
      <div className="pt-24 pb-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <CalendarIcon className="h-4 w-4 text-primary" />
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
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Parking Spaces</h1>
          <p className="text-gray-600">{parkingSpots.length} spaces found</p>
        </div>

        <div className="space-y-6">
          {parkingSpots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left Side - Images */}
                <div className="relative h-80 lg:h-auto">
                  <img
                    src={spot.images[currentImageIndex[spot.id] || 0]}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {spot.type}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{spot.rating}</span>
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => prevImage(spot.id, spot.images.length)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => nextImage(spot.id, spot.images.length)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {spot.images.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === (currentImageIndex[spot.id] || 0) ? "bg-white" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>

                  {/* Thumbnail Navigation */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {spot.images.slice(0, 3).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(prev => ({ ...prev, [spot.id]: index }))}
                        className={cn(
                          "w-12 h-12 rounded border-2 overflow-hidden transition-colors",
                          index === (currentImageIndex[spot.id] || 0) ? "border-white" : "border-white/50"
                        )}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side - Booking Information */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{spot.name}</h3>
                    <div className="text-2xl font-bold text-primary mb-1">
                      From: {calculateDiscountedPrice(spot.price, selectedDuration[spot.id] ? getDurationOptions(spot.price).find(d => d.label === selectedDuration[spot.id])?.discount : null).toFixed(2)} د.إ
                    </div>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {spot.location}
                    </p>
                  </div>

                  {/* Reserve a Parking Space Section */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900">Reserve a Parking Space</h4>
                    
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate[spot.id] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate[spot.id] ? format(startDate[spot.id], "dd.MM.yyyy") : "07.07.2025"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate[spot.id] || new Date("2025-07-07")}
                            onSelect={(date) => setStartDate(prev => ({ ...prev, [spot.id]: date || new Date() }))}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Rental Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Rental Duration</label>
                      <div className="grid grid-cols-2 gap-3">
                        {getDurationOptions(spot.price).map((option) => {
                          const isSelected = selectedDuration[spot.id] === option.label;
                          const discountedPrice = calculateDiscountedPrice(option.price, option.discount);
                          
                          return (
                            <button
                              key={option.label}
                              onClick={() => setSelectedDuration(prev => ({ ...prev, [spot.id]: option.label }))}
                              className={cn(
                                "p-4 rounded-lg border-2 text-left transition-all",
                                isSelected 
                                  ? "border-primary bg-primary/5" 
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="font-semibold text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">AED {discountedPrice.toFixed(2)}</div>
                              {option.discount && (
                                <div className="text-sm font-medium text-primary">{option.discount}</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full border-2 border-primary"></div>
                        <span className="font-medium text-gray-900">Benefits:</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Guaranteed parking space</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span>Fixed price - no increases during rental</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Headphones className="h-4 w-4 text-primary" />
                          <span>Priority customer support</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Rolling Option */}
                    <div className="text-center">
                      <Button variant="link" className="text-primary hover:text-primary/80">
                        Or choose Monthly Rolling (subject to availability)
                      </Button>
                    </div>

                    {/* Book Now Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold">
                      Reserve Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindParking;