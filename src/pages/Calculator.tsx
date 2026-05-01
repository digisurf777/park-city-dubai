import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingCalculator from "@/components/ParkingCalculator";
import { Sparkles, TrendingUp, Wallet } from "lucide-react";

const Calculator = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-background to-background animate-fade-in">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 sm:pt-28 pb-10 sm:pb-14 bg-gradient-hero text-primary-foreground">
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/15 blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-white text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Earnings calculator
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 leading-tight">
            See how much your parking space could earn
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Adjust the rent below — we'll instantly show your monthly take-home for 1, 3, 6 and 12 month bookings.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto mt-8">
            {[
              { Icon: TrendingUp, value: "Up to 15%", label: "Long-term bonus" },
              { Icon: Wallet, value: "0%", label: "Listing fee" },
              { Icon: Sparkles, value: "5 min", label: "Setup time" },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="glass-dark rounded-xl p-3 text-left">
                <Icon className="h-4 w-4 text-primary-glow mb-1" />
                <div className="text-sm sm:text-base font-bold">{value}</div>
                <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-10 sm:py-14 lg:py-16 -mt-6 sm:-mt-8 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParkingCalculator />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Calculator;
