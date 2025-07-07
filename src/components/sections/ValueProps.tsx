import { Shield, DollarSign, Clock } from "lucide-react";

const ValueProps = () => {
  return (
    <section className="py-16 bg-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Guaranteed Parking</h3>
            <p className="text-muted-foreground">Your space is reserved and waiting for you</p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Fixed Price</h3>
            <p className="text-muted-foreground">No surge pricing, no hidden fees</p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Save Time</h3>
            <p className="text-muted-foreground">Skip the search, drive straight to your spot</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProps;