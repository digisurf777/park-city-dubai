import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, Calendar, CreditCard, ArrowRight, TrendingUp, Info } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

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
    { value: 12, label: "12 Months", discount: 0.15 },
  ];

  const calculateEarnings = () => {
    const results: DurationCalculation[] = durations.map(duration => {
      const rentAfterDiscount = baseRent * (1 - duration.discount);
      const shazamFee = rentAfterDiscount * 0.20;
      const cardFee = cardRequired ? 100 : 0;
      let netToOwner;
      if (duration.value === 1) {
        netToOwner = rentAfterDiscount - shazamFee - cardFee;
      } else {
        const totalEarnings = (rentAfterDiscount - shazamFee) * duration.value;
        const totalWithCardFee = totalEarnings - (cardRequired ? 100 : 0);
        netToOwner = totalWithCardFee / duration.value;
      }
      return { duration: duration.value, discount: duration.discount * 100, rentAfterDiscount, shazamFee, cardFee, netToOwner };
    });
    setCalculations(results);
  };

  useEffect(() => { calculateEarnings(); }, [baseRent, cardRequired]);

  const handleDurationToggle = (duration: number, checked: boolean) => {
    if (checked) setSelectedDurations([...selectedDurations, duration]);
    else setSelectedDurations(selectedDurations.filter(d => d !== duration));
  };

  const getCustomerPrice = (rentAfterDiscount: number) => rentAfterDiscount + 100;

  const handleBaseRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/^0+/, '') || '0';
    const numericValue = Number(cleanValue);
    if (!isNaN(numericValue) && numericValue >= 0) setBaseRent(numericValue);
  };

  const visibleCalcs = calculations.filter(c => selectedDurations.includes(c.duration));
  const bestCalc = visibleCalcs.reduce<DurationCalculation | null>(
    (best, c) => (!best || c.netToOwner > best.netToOwner ? c : best),
    null
  );

  return (
    <div className="space-y-6">
      {/* Highlight result card */}
      {bestCalc && (
        <Card className="overflow-hidden border-0 shadow-elegant rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-deep text-primary-foreground">
          <CardContent className="p-6 sm:p-8 relative">
            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/15 blur-3xl"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/80 mb-1">Best monthly net</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black leading-none">
                    {bestCalc.netToOwner.toFixed(0)}
                  </span>
                  <span className="text-lg font-semibold text-white/90">AED / month</span>
                </div>
                <p className="text-sm text-white/80 mt-2">
                  At {bestCalc.duration} {bestCalc.duration === 1 ? "month" : "months"} - based on {baseRent} AED base rent
                </p>
              </div>
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculator Inputs */}
      <Card className="glass-card border-0 shadow-soft rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <CalcIcon className="h-4 w-4" />
            </span>
            Configure your space
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base Rent Input */}
          <div className="space-y-2">
            <Label htmlFor="baseRent" className="text-sm font-semibold">Base Monthly Rent</Label>
            <div className="relative">
              <Input
                id="baseRent"
                type="text"
                inputMode="numeric"
                value={baseRent || ''}
                onChange={handleBaseRentChange}
                placeholder="1000"
                className="h-14 text-2xl font-bold pr-16 bg-background/60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                AED
              </span>
            </div>
          </div>

          {/* Card Required Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
            <div className="space-y-1 pr-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-primary" />
                Access Card Required?
              </Label>
              <p className="text-xs text-muted-foreground">500 AED refundable deposit + 100 AED one-time fee</p>
            </div>
            <Switch checked={cardRequired} onCheckedChange={setCardRequired} />
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Accepted Rental Durations
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {durations.map(duration => {
                const checked = selectedDurations.includes(duration.value);
                return (
                  <label
                    key={duration.value}
                    htmlFor={`duration-${duration.value}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-background/40 hover:border-primary/40"
                    }`}
                  >
                    <Checkbox
                      id={`duration-${duration.value}`}
                      checked={checked}
                      onCheckedChange={c => handleDurationToggle(duration.value, c as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{duration.label}</div>
                      {duration.discount > 0 && (
                        <div className="text-xs text-primary font-medium">−{duration.discount * 100}% bonus</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card className="glass-card border-0 shadow-soft rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Monthly earnings breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {visibleCalcs.map(calc => (
              <div
                key={calc.duration}
                className="p-4 rounded-xl bg-background/60 border border-border/60 hover-lift"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-bold">
                      {calc.duration} Month{calc.duration > 1 ? "s" : ""}
                    </div>
                    {calc.discount > 0 && (
                      <div className="text-xs text-primary font-medium">−{calc.discount}% discount</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase">Net / month</div>
                    <div className="text-xl font-black text-primary">
                      {calc.netToOwner.toFixed(0)} <span className="text-xs text-muted-foreground font-medium">AED</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-muted/40 rounded-md px-2 py-1.5">
                    <span className="text-muted-foreground">Customer pays</span>
                    <span className="font-semibold text-foreground">{getCustomerPrice(calc.rentAfterDiscount).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between bg-muted/40 rounded-md px-2 py-1.5">
                    <span className="text-muted-foreground">Rent</span>
                    <span className="font-semibold text-foreground">{calc.rentAfterDiscount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between bg-muted/40 rounded-md px-2 py-1.5">
                    <span className="text-muted-foreground">Fee 20%</span>
                    <span className="font-semibold text-destructive">−{calc.shazamFee.toFixed(0)}</span>
                  </div>
                  {cardRequired && (
                    <div className="flex justify-between bg-muted/40 rounded-md px-2 py-1.5">
                      <span className="text-muted-foreground">Card</span>
                      <span className="font-semibold text-destructive">−100</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Duration</th>
                  <th className="text-left p-3 font-semibold">Discount</th>
                  <th className="text-left p-3 font-semibold">Rent after discount</th>
                  <th className="text-left p-3 font-semibold">Customer pays*</th>
                  <th className="text-left p-3 font-semibold">Shazam fee (20%)</th>
                  {cardRequired && <th className="text-left p-3 font-semibold">Card fee</th>}
                  <th className="text-left p-3 font-semibold">Net to you</th>
                </tr>
              </thead>
              <tbody>
                {visibleCalcs.map(calc => (
                  <tr key={calc.duration} className="border-t border-border/40 hover:bg-primary/5 transition-colors">
                    <td className="p-3 font-semibold">{calc.duration} Month{calc.duration > 1 ? 's' : ''}</td>
                    <td className="p-3">{calc.discount > 0 ? `−${calc.discount}%` : 'None'}</td>
                    <td className="p-3">{calc.rentAfterDiscount.toFixed(0)} AED</td>
                    <td className="p-3 text-foreground/80">{getCustomerPrice(calc.rentAfterDiscount).toFixed(0)} AED</td>
                    <td className="p-3 text-destructive">−{calc.shazamFee.toFixed(0)} AED</td>
                    {cardRequired && <td className="p-3 text-destructive">−100 AED</td>}
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                        {calc.netToOwner.toFixed(0)} AED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex gap-2 text-xs sm:text-sm text-foreground/80">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p>
              <strong>Customer pricing</strong> includes a +100 AED/month service fee.
              {cardRequired && " Access card requires a 500 AED refundable deposit."}
            </p>
          </div>

          {cardRequired && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800">
              <strong>Card fee details:</strong> A one-off 100 AED fee applies when an access card is required.
              The 500 AED card deposit is refundable when the driver returns the access device.
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/rent-out-your-space" className="flex-1">
              <Button size="lg" className="w-full">
                List your space now
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/find-parking" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Browse spaces
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingCalculator;
