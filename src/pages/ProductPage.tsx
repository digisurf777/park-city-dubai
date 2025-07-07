import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Car, CreditCard, Ruler, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductPage = () => {
  const { id } = useParams();
  const [startDate, setStartDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState<number>(12);

  // Mock data - in real app, fetch by ID
  const parkingSpots = [
    {
      id: 1,
      name: "Marina Gate Parking Bay",
      district: "Dubai Marina",
      price: 450,
      image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
      specs: ["Compact Size", "Access Card", "2.1m Height"],
      available: true,
      description: "Secure underground parking bay in the heart of Dubai Marina. Easy access to metro, shopping, and dining. 24/7 security and CCTV monitoring."
    },
    {
      id: 2,
      name: "DIFC Gate Village Bay",
      district: "DIFC",
      price: 650,
      image: "/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png",
      specs: ["Large Size", "Remote Access", "3.0m Height"],
      available: true,
      description: "Premium parking space in DIFC Gate Village. Perfect for business professionals with covered parking and elevator access."
    }
  ];

  const spot = parkingSpots.find(s => s.id === parseInt(id || "1")) || parkingSpots[0];

  const durationOptions = [
    { months: 1, discount: 0, label: "1 Month" },
    { months: 3, discount: 5, label: "3 Months" },
    { months: 6, discount: 10, label: "6 Months" },
    { months: 12, discount: 15, label: "12 Months" }
  ];

  const calculatePrice = () => {
    const basePrice = spot.price * selectedDuration;
    const selectedOption = durationOptions.find(opt => opt.months === selectedDuration);
    const discount = selectedOption?.discount || 0;
    const discountAmount = (basePrice * discount) / 100;
    return {
      basePrice,
      discountAmount,
      totalPrice: basePrice - discountAmount,
      discount
    };
  };

  const pricing = calculatePrice();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <Link 
          to="/find-a-parking-space" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Info */}
          <div>
            <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                From AED {spot.price} / month
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{spot.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{spot.district}</p>

            {/* Specs */}
            <div className="flex items-center gap-6 mb-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <span>{spot.specs[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>{spot.specs[1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                <span>{spot.specs[2]}</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {spot.description}
            </p>

            {/* Benefits */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Benefits:</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Guaranteed parking space</li>
                <li>• Fixed price - no increases during rental</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Reserve Your Space</h2>
              
              {/* Start Date */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rental Duration */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-4 block">Rental Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  {durationOptions.map((option) => (
                    <Card
                      key={option.months}
                      className={cn(
                        "cursor-pointer transition-all border-2",
                        selectedDuration === option.months
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedDuration(option.months)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="font-semibold mb-1">{option.label}</div>
                        {option.months === 1 ? (
                          <div className="text-sm opacity-75">AED {spot.price}.00</div>
                        ) : (
                          <div className="text-sm font-medium">{option.discount}% OFF</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Monthly Rolling Option */}
              <div className="text-center mb-6">
                <p className="text-sm text-primary">
                  Or choose Monthly Rolling (subject to availability)
                </p>
              </div>

              {/* Price Summary */}
              <Card className="bg-muted/50 p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">
                    AED {pricing.totalPrice.toFixed(2)}
                  </span>
                </div>
                {pricing.discount > 0 && (
                  <div className="text-sm text-green-600">
                    You save AED {pricing.discountAmount.toFixed(2)} with {pricing.discount}% OFF
                  </div>
                )}
              </Card>

              <Button 
                className="w-full h-12 text-white font-medium"
                style={{ backgroundColor: '#00B67A' }}
                disabled={!startDate}
              >
                Reserve Now
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;