import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Car, Clock, CreditCard, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ParkingSpot {
  id: string | number;
  name: string;
  price: number;
  image: string;
  specs?: string[];
  address?: string;
  description?: string;
}

interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingSpot: ParkingSpot | null;
}

const DURATION_OPTIONS = [
  { months: 1, label: "1 Month", discount: 0, description: "Monthly rate" },
  { months: 3, label: "3 Months", discount: 5, description: "5% OFF" },
  { months: 6, label: "6 Months", discount: 10, description: "10% OFF" },
  { months: 12, label: "12 Months", discount: 15, description: "15% OFF" },
];

export const ParkingBookingModal = ({ isOpen, onClose, parkingSpot }: ParkingBookingModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setSelectedDuration(DURATION_OPTIONS[0]);
      setIsCalendarOpen(false);
    }
  }, [isOpen]);

  if (!parkingSpot) return null;

  const calculateTotal = () => {
    const basePrice = parkingSpot.price * selectedDuration.months;
    const discountAmount = (basePrice * selectedDuration.discount) / 100;
    return {
      basePrice,
      discountAmount,
      finalPrice: basePrice - discountAmount,
      savings: discountAmount,
    };
  };

  const { basePrice, discountAmount, finalPrice, savings } = calculateTotal();

  const handleReserve = () => {
    if (!startDate) {
      alert("Please select a start date");
      return;
    }
    
    // Here you would integrate with your booking system
    console.log("Booking details:", {
      parkingSpot: parkingSpot.name,
      startDate,
      duration: selectedDuration,
      totalPrice: finalPrice,
    });
    
    alert(`Booking request submitted for ${parkingSpot.name}!\nStart Date: ${format(startDate, "PPP")}\nDuration: ${selectedDuration.label}\nTotal: AED ${finalPrice.toLocaleString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Reserve Parking Space</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Parking Details */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={parkingSpot.image} 
                alt={parkingSpot.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">{parkingSpot.name}</h3>
              {parkingSpot.address && (
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{parkingSpot.address}</span>
                </div>
              )}
              {parkingSpot.description && (
                <p className="text-sm text-muted-foreground mb-4">{parkingSpot.description}</p>
              )}
              
              {parkingSpot.specs && parkingSpot.specs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {parkingSpot.specs.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="space-y-6">
            {/* Start Date Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Rental Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <Button
                    key={option.months}
                    variant={selectedDuration.months === option.months ? "default" : "outline"}
                    className="flex flex-col h-auto py-3 px-4"
                    onClick={() => setSelectedDuration(option)}
                  >
                    <span className="font-semibold">{option.label}</span>
                    {option.discount > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        {option.description}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Or choose Monthly Rolling (subject to availability)
              </p>
            </div>

            {/* Price Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Price Breakdown
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base price ({selectedDuration.months} month{selectedDuration.months > 1 ? 's' : ''})</span>
                    <span>AED {basePrice.toLocaleString()}</span>
                  </div>
                  
                  {selectedDuration.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{selectedDuration.discount}% discount</span>
                      <span>-AED {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>AED {finalPrice.toLocaleString()}</span>
                  </div>
                  
                  {savings > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      You save AED {savings.toLocaleString()} with {selectedDuration.discount}% OFF
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reserve Button */}
            <Button 
              onClick={handleReserve}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
              size="lg"
            >
              Reserve Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};