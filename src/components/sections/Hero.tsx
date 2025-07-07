import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Hero = () => {
  return (
    <section className="pt-20 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Find Your Perfect<br />
            <span className="text-primary">Parking Space</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Guaranteed monthly parking at a fixed price
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg border border-border p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter district, mall, or landmark..."
                  className="h-12 text-lg border-border focus:border-primary focus:ring-primary"
                />
              </div>
              <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Search Parking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;