import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-surface via-background to-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-xl w-full text-center">
          <div className="relative inline-block mb-6">
            <h1 className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-primary-glow to-primary-deep bg-clip-text text-transparent select-none">
              404
            </h1>
            <span className="absolute -top-2 -right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white shadow-lg ring-1 ring-primary/20 text-[10px] font-bold tracking-widest uppercase text-primary">
              <MapPin className="h-3 w-3" /> Lost
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            This parking spot doesn't exist
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for has been moved, removed or never existed.
            Let's get you back on the road.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/find-a-parking-space">
                <Search className="h-4 w-4" />
                Find Parking
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
            {[
              { to: "/about-us", label: "About" },
              { to: "/faq", label: "FAQ" },
              { to: "/rent-out-your-space", label: "List Space" },
              { to: "/calculator", label: "Calculator" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-lg bg-white ring-1 ring-primary/15 text-sm font-medium text-gray-700 hover:ring-primary/40 hover:text-primary transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>
      </main>
    </>
  );
};

export default NotFound;
