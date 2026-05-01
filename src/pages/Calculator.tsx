import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingCalculator from "@/components/ParkingCalculator";
import PageHero from "@/components/PageHero";
import heroCalculator from "@/assets/hero-calculator.jpg";
import { TrendingUp, Wallet, Sparkles } from "lucide-react";

const Calculator = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-background to-background animate-fade-in">
      <Navbar />

      <PageHero
        image={heroCalculator}
        eyebrow="Earnings calculator"
        title="See What Your Bay Could Earn"
        highlight="Could Earn"
        subtitle="Adjust the rent below - we'll instantly show your monthly take-home for 1, 3, 6 and 12 month bookings."
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto">
          {[
            { Icon: TrendingUp, value: "Up to 15%", label: "Long-term bonus" },
            { Icon: Wallet, value: "0%", label: "Listing fee" },
            { Icon: Sparkles, value: "5 min", label: "Setup time" },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 text-left">
              <Icon className="h-4 w-4 text-primary-glow mb-1" />
              <div className="text-sm sm:text-base font-bold text-white">{value}</div>
              <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </PageHero>

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
