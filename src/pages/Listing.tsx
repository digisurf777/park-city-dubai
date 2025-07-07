import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar as CalendarIcon, Shield, Car, Camera, Wifi } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Listing = () => {
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState<string>("1");
  
  const basePrice = 500; // AED per month
  
  const calculatePrice = (months: number) => {
    let discount = 1;
    switch (months) {
      case 3:
        discount = 0.95; // 5% discount
        break;
      case 6:
        discount = 0.90; // 10% discount
        break;
      case 12:
        discount = 0.85; // 15% discount
        break;
      default:
        discount = 1;
    }
    return Math.round(basePrice * months * discount);
  };

  const totalPrice = calculatePrice(parseInt(duration));
  const monthlyPrice = totalPrice / parseInt(duration);

  const images = [
    "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
    "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
    "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
    "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png"
  ];

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={images[selectedImage]} 
                  alt="Parking space"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-video bg-muted rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImage === index ? "border-primary" : "border-transparent"
                    )}
                  >
                    <img 
                      src={image} 
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              {/* Property Details */}
              <Card className="p-6 border-border">
                <h1 className="text-3xl font-bold text-foreground mb-4">Downtown Parking Bay</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Downtown Dubai, Dubai, UAE</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Secure Access
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        Covered Parking
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        24/7 CCTV
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        Climate Controlled
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      Premium covered parking space in the heart of Downtown Dubai. 
                      Located in a secure building with 24/7 access, CCTV monitoring, 
                      and climate control. Perfect for professionals working in the area 
                      or visitors to Dubai Mall and surrounding attractions.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Booking Panel */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6 border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Reserve a Parking Space</h2>
                
                <div className="space-y-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Date *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-border",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Duration
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month</SelectItem>
                        <SelectItem value="3">3 Months (5% discount)</SelectItem>
                        <SelectItem value="6">6 Months (10% discount)</SelectItem>
                        <SelectItem value="12">12 Months (15% discount)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-secondary/20 p-4 rounded-lg border border-border">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base price per month:</span>
                        <span className="font-medium">AED {basePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{duration} month{parseInt(duration) > 1 ? 's' : ''}</span>
                      </div>
                      {parseInt(duration) > 1 && (
                        <div className="flex justify-between text-sm text-primary">
                          <span>Discount applied:</span>
                          <span className="font-medium">
                            {duration === "3" && "5%"}
                            {duration === "6" && "10%"}
                            {duration === "12" && "15%"}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-foreground">Total Price:</span>
                          <span className="font-bold text-primary text-lg">AED {totalPrice}</span>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          (AED {Math.round(monthlyPrice)} / month)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold"
                    disabled={!date}
                  >
                    BOOK NOW
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Minimum rental period: 1 month. Security deposit may apply.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Listing;