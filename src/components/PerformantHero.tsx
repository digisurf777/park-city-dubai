import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PerformantHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Preload critical background image */}
      <link 
        rel="preload" 
        as="image" 
        href="/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png"
        fetchPriority="high"
      />
      
      {/* Optimized background with better performance */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/lovable-uploads/25c56481-0d03-4055-bd47-67635ac0d1b0.png')`,
          willChange: 'transform'
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-20 sm:pt-24 lg:pt-0 py-8 sm:py-16 lg:py-[141px]">
          {/* Left side - Text */}
          <div className="text-center lg:text-left lg:flex-1 mb-8 lg:mb-0 mt-8 sm:mt-16 lg:mt-0 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight px-2 lg:px-0 mb-4">
              <span className="block text-white" style={{
                textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)'
              }}>
                YOUR TRUSTED
              </span>
              <span className="block text-primary font-black" style={{
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
              }}>
                PARKING PLATFORM
              </span>
              <span className="block text-white" style={{
                textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)'
              }}>
                IN DUBAI
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mt-4 px-2 lg:px-0" style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
            }}>
              List your parking space in minutes and start earning every month.
            </p>
          </div>
          
          {/* Right side - Phone Image */}
          <div className="lg:flex-1 flex justify-center lg:justify-end">
            <img 
              alt="Shazam Parking Mobile App" 
              className="w-64 sm:w-80 md:w-96 lg:max-w-md h-auto transition-transform duration-300 hover:scale-105" 
              src="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width="384"
              height="auto"
            />
          </div>
        </div>
        
        {/* CTA Button - Centered */}
        <div className="flex justify-center mt-8 sm:mt-12 lg:absolute lg:bottom-20 lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4">
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto shadow-lg transition-all duration-300 hover:scale-105 touch-manipulation min-h-[48px]">
              LOGIN / SIGN UP
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PerformantHero;