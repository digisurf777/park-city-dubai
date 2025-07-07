import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import ValueProps from "@/components/sections/ValueProps";
import FeaturedSpaces from "@/components/sections/FeaturedSpaces";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ValueProps />
      <FeaturedSpaces />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  );
};

export default Index;