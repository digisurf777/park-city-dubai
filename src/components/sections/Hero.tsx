import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const Hero = () => {
  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Your Trusted Parking Platform<br />
          <span className="text-primary">in Dubai</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Guaranteed monthly parking at a fixed price
        </p>
        
        {/* Popular Locations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">POPULAR PARKING LOCATIONS IN DUBAI</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              'Dubai Marina',
              'Downtown',
              'Palm Jumeirah', 
              'Business Bay',
              'DIFC',
              'Deira'
            ].map((location) => (
              <Card key={location} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-white mb-2">{location}</h3>
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Select Zone
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;