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
    { label: "1 Month", months: 1, discount: null },
    { label: "3 Months", months: 3, discount: "5% OFF" },
    { label: "6 Months", months: 6, discount: "10% OFF" },
    { label: "12 Months", months: 12, discount: "15% OFF" }
  ];

  const calculateDiscountedPrice = (basePrice: number, months: number, discount: string | null) => {
    const totalPrice = basePrice * months;
    if (!discount) return totalPrice;
    const discountPercent = parseInt(discount.replace('% OFF', ''));
    return Math.round(totalPrice * (100 - discountPercent) / 100);
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
      
      {/* Hero Section with Search */}
      <div className="pt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find a Parking Space</h1>
            <p className="text-xl text-gray-600">Secure your parking spot in Dubai's prime locations</p>
          </div>
          
          {/* Enhanced Search Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </label>
                <Input
                  placeholder="Enter area, mall, or landmark..."
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Start Date
                </label>
                <Input
                  type="date"
                  defaultValue="2025-07-07"
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Duration
                </label>
                <select className="w-full h-12 px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-primary focus:outline-none text-lg bg-white">
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>12 Months</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-lg font-semibold">
                  Search Parking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Indoor Parking
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Outdoor Parking
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Valet Service
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              24/7 Access
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Price: Low to High
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Parking Spaces</h2>
            <p className="text-gray-600 mt-1">{parkingSpots.length} spaces found in Dubai</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
            <Button variant="outline" size="sm">
              List View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {parkingSpots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="relative lg:w-2/5 h-64 lg:h-auto">
                  <img
                    src={spot.images[currentImageIndex[spot.id] || 0]}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Navigation */}
                  <button
                    onClick={() => prevImage(spot.id, spot.images.length)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => nextImage(spot.id, spot.images.length)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {spot.type}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{spot.rating}</span>
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
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
                </div>

                {/* Content Section */}
                <div className="lg:w-3/5 p-6">
                  {/* Header Info */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{spot.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{spot.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{spot.availability}</span>
                    </div>
                  </div>

                  {/* Booking Section */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Reserve Your Space</h4>
                    
                    {/* Start Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-11",
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

                    {/* Duration Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Rental Duration</label>
                      <div className="grid grid-cols-2 gap-3">
                        {getDurationOptions(spot.price).map((option) => {
                          const isSelected = selectedDuration[spot.id] === option.label;
                          const discountedPrice = calculateDiscountedPrice(spot.price, option.months, option.discount);
                          
                          return (
                            <button
                              key={option.label}
                              onClick={() => setSelectedDuration(prev => ({ ...prev, [spot.id]: option.label }))}
                              className={cn(
                                "p-3 rounded-lg border-2 text-left transition-all hover:shadow-md",
                                isSelected 
                                  ? "border-primary bg-primary text-white" 
                                  : "border-gray-200 hover:border-primary bg-white"
                              )}
                            >
                              <div className="font-semibold text-sm">{option.label}</div>
                              <div className={cn("text-lg font-bold", isSelected ? "text-white" : "text-primary")}>
                                AED {discountedPrice.toFixed(0)}
                              </div>
                              {option.discount && (
                                <div className={cn("text-xs font-medium", isSelected ? "text-primary-foreground" : "text-green-600")}>
                                  {option.discount}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="text-2xl font-bold text-primary">
                          AED {(() => {
                            const selectedOption = getDurationOptions(spot.price).find(d => d.label === selectedDuration[spot.id]);
                            return selectedOption ? calculateDiscountedPrice(spot.price, selectedOption.months, selectedOption.discount).toFixed(0) : spot.price.toFixed(0);
                          })()}
                        </span>
                      </div>
                      {selectedDuration[spot.id] && (() => {
                        const selectedOption = getDurationOptions(spot.price).find(d => d.label === selectedDuration[spot.id]);
                        if (selectedOption?.discount) {
                          const originalPrice = spot.price * selectedOption.months;
                          const discountedPrice = calculateDiscountedPrice(spot.price, selectedOption.months, selectedOption.discount);
                          return (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              You save AED {(originalPrice - discountedPrice).toFixed(0)} with {selectedOption.discount}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Benefits */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          Guaranteed Space
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Car className="h-3 w-3" />
                          Fixed Price
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-bold">
                        BOOK NOW
                      </Button>
                      <Button variant="link" className="w-full text-primary hover:text-primary/80">
                        Monthly Rolling Option
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" className="px-8 py-3">
            Load More Parking Spaces
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FindParking;