import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Car, Clock, CreditCard, MapPin, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface ParkingSpot {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  specs?: string[];
  address?: string;
  description?: string;
}
interface ParkingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingSpot: ParkingSpot | null;
}
const DURATION_OPTIONS = [{
  months: 1,
  label: "1 Month",
  multiplier: 1.0,
  description: "Monthly rate"
}, {
  months: 3,
  label: "3 Months",
  multiplier: 0.95,
  description: "5% OFF"
}, {
  months: 6,
  label: "6 Months",
  multiplier: 0.90,
  description: "10% OFF"
}, {
  months: 12,
  label: "12 Months",
  multiplier: 0.85,
  description: "15% OFF"
}];
export const ParkingBookingModal = ({
  isOpen,
  onClose,
  parkingSpot
}: ParkingBookingModalProps) => {
  // Disable all bookings - show as currently booked
  const isCurrentlyBooked = true;
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setSelectedDuration(DURATION_OPTIONS[0]);
      setIsCalendarOpen(false);
      setIsSubmitting(false);
      setShowConfirmation(false);
      setBookingReference("");
    }
  }, [isOpen]);
  if (!parkingSpot) return null;
  const calculateTotal = () => {
    // Use the correct formula: ((Listing Price – 100) × multiplier) × Number of Months + (100 × Number of Months)
    let finalPrice: number;
    let savings: number = 0;
    if (selectedDuration.months === 1) {
      // For 1 month, use the original price
      finalPrice = parkingSpot.price;
    } else {
      // For 3, 6, 12 months, use the formula
      const discountedAmount = (parkingSpot.price - 100) * selectedDuration.multiplier;
      finalPrice = discountedAmount * selectedDuration.months + 100 * selectedDuration.months;

      // Calculate savings compared to regular monthly rate
      const regularTotal = parkingSpot.price * selectedDuration.months;
      savings = regularTotal - finalPrice;
    }
    return {
      basePrice: parkingSpot.price * selectedDuration.months,
      finalPrice: Math.round(finalPrice),
      savings: Math.round(savings)
    };
  };
  const {
    basePrice,
    finalPrice,
    savings
  } = calculateTotal();
  const handleReserve = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: <div className="space-y-3">
            <p className="text-sm">Please log in to submit a booking request.</p>
            <div className="flex space-x-3">
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/auth'} className="bg-white text-destructive hover:bg-gray-100 font-semibold px-4 py-2">
                Login
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.location.href = '/auth'} className="bg-white text-destructive hover:bg-gray-100 font-semibold px-4 py-2">
                Sign Up
              </Button>
            </div>
          </div>,
        variant: "destructive"
      });
      return;
    }
    if (!startDate) {
      toast({
        title: "Start Date Required",
        description: "Please select a start date for your booking.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingData = {
        startDate: startDate.toISOString(),
        duration: selectedDuration.months,
        zone: "Find Parking Page",
        location: parkingSpot.name,
        costAed: finalPrice,
        parkingSpotName: parkingSpot.name
      };
      const {
        data,
        error
      } = await supabase.functions.invoke('submit-booking-request', {
        body: bookingData
      });
      if (error) throw error;
      console.log('Booking request submitted:', data);
      setBookingReference(data.bookingId?.slice(0, 8).toUpperCase() || "");
      setShowConfirmation(true);
      toast({
        title: "Booking Submitted Successfully",
        description: "Please check your email for the payment link to complete your booking."
      });
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if start date is within 7 days
  const isWithin7Days = startDate ? (startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 : false;

  // Show confirmation screen
  if (showConfirmation) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">✅ Booking Submitted Successfully!</h2>
            
            <div className="bg-green-50 p-6 rounded-lg mb-4">
              <h3 className="font-semibold mb-3 text-green-800">✅ Payment Link Sent to Email!</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto text-green-700">
                <li>• A secure payment link has been sent to your email</li>
                <li>• Check your inbox for payment instructions</li>
                <li>• Complete payment setup to secure your space</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-3 text-blue-800">Next Steps:</h3>
              <ul className="text-left space-y-2 max-w-md mx-auto text-blue-700">
                <li>• Complete your payment setup using the link</li>
                <li>• We'll review and confirm within 2 business days</li>
                <li>• Automatic refund if booking is not approved</li>
                <li>• Check your email for detailed instructions</li>
              </ul>
            </div>

            {bookingReference && <p className="text-muted-foreground mb-6">
                Booking Reference: <strong>{bookingReference}</strong>
              </p>}

            <div className="space-y-4">
              <Button onClick={() => setShowConfirmation(false)} variant="outline">
                Submit Another Request
              </Button>
              <div>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">Space Currently Booked</DialogTitle>
        </DialogHeader>

        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-red-500" />
          </div>
          
          <h3 className="text-xl font-semibold text-red-700 mb-4">This parking space is currently occupied</h3>
          
          <div className="bg-red-50 p-6 rounded-lg mb-6 border border-red-200">
            <p className="text-red-700 mb-4">
              <strong>{parkingSpot?.name}</strong> is currently booked and not available for new reservations.
            </p>
            <p className="text-red-600 text-sm">
              All parking spaces are currently occupied. Please check back later or explore other locations.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="border-red-500 text-red-700 hover:bg-red-50"
            >
              Find Other Spaces
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};