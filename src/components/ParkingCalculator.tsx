import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Calculator as CalcIcon, Calendar, CreditCard, ArrowRight,
  TrendingUp, Info, Download, Link as LinkIcon, Mail, Sparkles
} from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

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
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRent = Number(searchParams.get("rent")) || 1000;

  const [baseRent, setBaseRent] = useState<number>(initialRent);
  const [cardRequired, setCardRequired] = useState<boolean>(searchParams.get("card") === "1");
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

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (baseRent && baseRent !== 1000) params.set("rent", String(baseRent));
    if (cardRequired) params.set("card", "1");
    setSearchParams(params, { replace: true });
  }, [baseRent, cardRequired, setSearchParams]);

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

  // Chart data
  const chartData = useMemo(
    () => visibleCalcs.map(c => ({
      name: `${c.duration}M`,
      net: Math.round(c.netToOwner),
      total: Math.round(c.netToOwner * c.duration),
      isBest: bestCalc ? c.duration === bestCalc.duration : false,
    })),
    [visibleCalcs, bestCalc]
  );

  // Save / share actions
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/calculator?rent=${baseRent}${cardRequired ? "&card=1" : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied 🔗", description: "Share your quote with anyone." });
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  const handleEmailQuote = () => {
    const subject = encodeURIComponent(`My Shazam Parking quote: ${baseRent} AED base rent`);
    const lines = visibleCalcs.map(c =>
      `• ${c.duration} month${c.duration > 1 ? 's' : ''}: ${c.netToOwner.toFixed(0)} AED/month net`
    ).join('%0D%0A');
    const url = `${window.location.origin}/calculator?rent=${baseRent}${cardRequired ? "&card=1" : ""}`;
    const body = encodeURIComponent(
      `Here is my parking earnings estimate from Shazam Parking:\n\nBase rent: ${baseRent} AED/month\nAccess card: ${cardRequired ? "Yes" : "No"}\n\nMonthly net earnings:\n`
    ) + lines + encodeURIComponent(`\n\nView and adjust: `) + encodeURIComponent(url);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Shazam Parking — Earnings Quote", 14, 18);

    // Body
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Base monthly rent: ${baseRent} AED`, 14, 48);
    doc.text(`Access card required: ${cardRequired ? "Yes (500 AED deposit + 100 AED fee)" : "No"}`, 14, 56);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Monthly net earnings", 14, 72);

    // Table
    let y = 82;
    doc.setFontSize(10);
    doc.setFillColor(240, 253, 244);
    doc.rect(14, y - 6, pageW - 28, 8, "F");
    doc.text("Duration", 18, y);
    doc.text("Discount", 60, y);
    doc.text("Rent (AED)", 95, y);
    doc.text("Net / month", 140, y);
    doc.text("Total", 175, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    visibleCalcs.forEach(c => {
      doc.text(`${c.duration} month${c.duration > 1 ? 's' : ''}`, 18, y);
      doc.text(c.discount > 0 ? `-${c.discount}%` : "None", 60, y);
      doc.text(`${c.rentAfterDiscount.toFixed(0)}`, 95, y);
      doc.text(`${c.netToOwner.toFixed(0)}`, 140, y);
      doc.text(`${(c.netToOwner * c.duration).toFixed(0)}`, 175, y);
      y += 8;
    });

    if (bestCalc) {
      y += 6;
      doc.setFillColor(22, 163, 74);
      doc.rect(14, y, pageW - 28, 14, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Best plan: ${bestCalc.duration} months — ${bestCalc.netToOwner.toFixed(0)} AED/month net`,
        18, y + 9
      );
    }

    // Footer
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Estimates only. Final earnings depend on listing approval and demand. shazamparking.ae",
      14, doc.internal.pageSize.getHeight() - 12
    );

    doc.save(`shazam-parking-quote-${baseRent}aed.pdf`);
    toast({ title: "PDF downloaded 📄", description: "Your quote is saved." });
  };

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
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
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
                        <div className="text-[11px] text-primary font-medium">−{duration.discount * 100}% bonus</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual chart */}
      {chartData.length > 0 && (
        <Card className="glass-card border-0 shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <TrendingUp className="h-4 w-4" />
              </span>
              Compare your earnings 📊
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Net earnings per month. Longer commitments unlock higher bonuses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-56 sm:h-64 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary) / 0.06)' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 8px 24px -8px hsl(var(--primary) / 0.25)',
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} AED`,
                      name === 'net' ? 'Net / month' : 'Total earnings',
                    ]}
                  />
                  <Bar dataKey="net" radius={[10, 10, 4, 4]}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.isBest ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.35)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

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

          {/* Save / share quote */}
          <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Save or share your quote
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="justify-center">
                <Download className="h-4 w-4 mr-1.5" /> Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmailQuote} className="justify-center">
                <Mail className="h-4 w-4 mr-1.5" /> Send by email
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="justify-center">
                <LinkIcon className="h-4 w-4 mr-1.5" /> Copy link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High-impact conversion CTA */}
      {bestCalc && (
        <Card className="overflow-hidden border-0 shadow-elegant rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-glow text-white relative">
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%),radial-gradient(circle_at_80%_80%,white,transparent_50%)]" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="h-3.5 w-3.5" /> Ready to earn
                </div>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                  You could earn up to{" "}
                  <span className="text-white underline decoration-white/40 decoration-4 underline-offset-4">
                    {bestCalc.netToOwner.toFixed(0)} AED
                  </span>{" "}
                  every month 🅿️
                </h3>
                <p className="text-sm sm:text-base text-white/85 max-w-lg">
                  List your space in 5 minutes. No fees to start, full support, fully managed payouts.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:min-w-[220px]">
                <Link to="/rent-out-your-space" className="flex-1">
                  <Button size="lg" className="w-full bg-white text-primary-deep hover:bg-white/95 font-bold shadow-xl">
                    List your space now
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/find-parking" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                    Browse spaces
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParkingCalculator;
