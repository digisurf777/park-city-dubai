import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingCalculator from "@/components/ParkingCalculator";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-white animate-zoom-slow">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Parking Earnings Calculator
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
            Calculate your potential monthly earnings from renting out your parking space
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParkingCalculator />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Calculator;