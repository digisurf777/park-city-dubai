import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign, Calendar, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DurationCalculation {
  duration: number;
  discount: number;
  rentAfterDiscount: number;
  shazamFee: number;
  cardFee: number;
  netToOwner: number;
}

const ParkingCalculator = () => {
  const navigate = useNavigate();
  const [baseRent, setBaseRent] = useState<number>(1000);
  const [cardRequired, setCardRequired] = useState<boolean>(false);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([1, 3, 6, 12]);
  const [calculations, setCalculations] = useState<DurationCalculation[]>([]);

  const durations = [
    { value: 1, label: "1 Month", discount: 0 },
    { value: 3, label: "3 Months", discount: 0.05 },
    { value: 6, label: "6 Months", discount: 0.10 },
    { value: 12, label: "12 Months", discount: 0.15 }
  ];

  const calculateEarnings = () => {
    const results: DurationCalculation[] = durations.map(duration => {
      const rentAfterDiscount = baseRent * (1 - duration.discount);
      const shazamFee = rentAfterDiscount * 0.20; // 20% commission
      const cardFee = cardRequired ? 100 : 0; // One-time card fee when card required
      const netToOwner = rentAfterDiscount - shazamFee - (cardFee / duration.value);

      return {
        duration: duration.value,
        discount: duration.discount * 100,
        rentAfterDiscount,
        shazamFee,
        cardFee,
        netToOwner
      };
    });

    setCalculations(results);
  };

  useEffect(() => {
    calculateEarnings();
  }, [baseRent, cardRequired]);

  const handleDurationToggle = (duration: number, checked: boolean) => {
    if (checked) {
      setSelectedDurations([...selectedDurations, duration]);
    } else {
      setSelectedDurations(selectedDurations.filter(d => d !== duration));
    }
  };

  const getCustomerPrice = (rentAfterDiscount: number) => {
    return rentAfterDiscount + 100; // +100 AED service fee for customers
  };

  return (
    <div className="space-y-6">
      {/* Calculator Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Parking Space Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Rent Input */}
          <div className="space-y-2">
            <Label htmlFor="baseRent">Base Monthly Rent (AED)</Label>
            <Input
              id="baseRent"
              type="number"
              value={baseRent}
              onChange={(e) => setBaseRent(Number(e.target.value))}
              placeholder="Enter monthly rent in AED"
              min="100"
              step="50"
            />
          </div>

          {/* Card Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Access Card Required?
              </Label>
              <p className="text-sm text-muted-foreground">
                Requires 500 AED deposit + 100 AED one-time fee
              </p>
            </div>
            <Switch
              checked={cardRequired}
              onCheckedChange={setCardRequired}
            />
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Accepted Rental Durations
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {durations.map(duration => (
                <div key={duration.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`duration-${duration.value}`}
                    checked={selectedDurations.includes(duration.value)}
                    onCheckedChange={(checked) => 
                      handleDurationToggle(duration.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`duration-${duration.value}`} className="text-sm">
                    {duration.label} 
                    {duration.discount > 0 && (
                      <span className="text-green-600 ml-1">
                        (-{duration.discount * 100}%)
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Monthly Earnings Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Discount</th>
                  <th className="text-left p-2">Rent After Discount</th>
                  <th className="text-left p-2">Customer Pays*</th>
                  <th className="text-left p-2">Shazam Fee (20%)</th>
                  {cardRequired && <th className="text-left p-2">Card Fee</th>}
                  <th className="text-left p-2 font-semibold">Net to You</th>
                </tr>
              </thead>
              <tbody>
                {calculations
                  .filter(calc => selectedDurations.includes(calc.duration))
                  .map(calc => (
                  <tr key={calc.duration} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{calc.duration} Month{calc.duration > 1 ? 's' : ''}</td>
                    <td className="p-2">
                      {calc.discount > 0 ? `-${calc.discount}%` : 'None'}
                    </td>
                    <td className="p-2">{calc.rentAfterDiscount.toFixed(0)} AED</td>
                    <td className="p-2 text-blue-600">
                      {getCustomerPrice(calc.rentAfterDiscount).toFixed(0)} AED
                    </td>
                    <td className="p-2 text-red-600">-{calc.shazamFee.toFixed(0)} AED</td>
                    {cardRequired && (
                      <td className="p-2 text-red-600">
                        {calc.cardFee > 0 ? `-${calc.cardFee} AED` : '-'}
                      </td>
                    )}
                    <td className="p-2 font-bold text-green-600">
                      {calc.netToOwner.toFixed(0)} AED
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>*Customer Pricing:</strong> Includes +100 AED/month service fee. 
              {cardRequired && " Requires 500 AED refundable deposit for access card."}
            </p>
          </div>

          {cardRequired && (
            <div className="mt-3 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Card Fee Details:</strong> 100 AED one-time fee applies for rentals 6+ months. 
                500 AED deposit is refundable when card is returned.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-green-800">
              Ready to List Your Space?
            </h3>
            <p className="text-sm text-green-700">
              You've selected {selectedDurations.length} rental duration{selectedDurations.length > 1 ? 's' : ''}.
              {selectedDurations.length > 0 && (
                <span className="block mt-1">
                  Estimated monthly earnings: {calculations
                    .filter(calc => selectedDurations.includes(calc.duration))
                    .map(calc => `${calc.netToOwner.toFixed(0)} AED`)
                    .join(' - ')
                  }
                </span>
              )}
            </p>
            <div className="flex justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate('/rent-out-your-space')}
              >
                Submit Your Parking Space
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingCalculator;