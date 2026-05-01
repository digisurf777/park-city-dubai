
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZonesOpen, setIsZonesOpen] = useState(false);
  
  // Add error boundary for auth hook
  let user, signOut;
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('Auth not ready in Navbar:', error);
    // Fallback values
    user = null;
    signOut = () => {};
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-primary/15 shadow-[0_4px_20px_-8px_hsl(var(--primary)/0.25)] pt-safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[60px]">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation min-h-[44px] min-w-[44px]" 
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.webp" 
              alt="Shazam Parking" 
              className="h-10 w-auto"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/find-a-parking-space" className="text-gray-700 hover:text-primary transition-colors">
              Find a Parking Space
            </Link>
            
            {/* Simple Zones Dropdown instead of NavigationMenu */}
            <div className="relative">
              <button 
                onClick={() => setIsZonesOpen(!isZonesOpen)}
                className="text-gray-700 hover:text-primary transition-colors flex items-center"
                onBlur={() => setTimeout(() => setIsZonesOpen(false), 200)}
              >
                Zones
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isZonesOpen && (
                <div className="absolute top-full left-0 mt-3 w-56 dropdown-premium z-50 animate-scale-in origin-top">
                  <div className="p-2 space-y-1">
                    {[
                      { to: "/dubai-marina", label: "Dubai Marina" },
                      { to: "/downtown", label: "Downtown" },
                      { to: "/palm-jumeirah", label: "Palm Jumeirah" },
                      { to: "/business-bay", label: "Business Bay" },
                      { to: "/difc", label: "DIFC" },
                      { to: "/deira", label: "Deira" },
                    ].map((z) => (
                      <Link
                        key={z.to}
                        to={z.to}
                        className="btn-3d block px-4 py-2.5 text-sm font-semibold text-foreground hover:text-primary rounded-lg transition-colors"
                        onClick={() => setIsZonesOpen(false)}
                      >
                        {z.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-primary transition-colors">
              News
            </Link>
            <Link to="/calculator" className="text-gray-700 hover:text-primary transition-colors">
              Calculator
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/my-account">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="text-gray-700 hover:text-primary"
                >
                  Logout
                </Button>
                <Link to="/rent-out-your-space">
                  <button className="btn-3d-primary px-5 py-2 rounded-lg font-semibold text-sm tracking-wide">
                    List Your Space
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary font-semibold">
                    Login / Sign Up
                  </Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <button className="btn-3d-primary px-5 py-2 rounded-lg font-semibold text-sm tracking-wide">
                    List Your Space
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-b border-primary/15 shadow-[0_20px_40px_-12px_hsl(var(--primary-deep)/0.35)] animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto mobile-scroll">
            <div className="px-4 py-6 space-y-2 pb-safe-area-bottom">
              
              {/* Auth Buttons - Top of mobile menu */}
              <div className="pb-4 mb-4 border-b border-gray-200 space-y-3">
                {user ? (
                  <>
                    <Link to="/my-account" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation text-left justify-start">
                        <User className="mr-3 h-5 w-5" />
                        My Account
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation"
                    >
                      Logout
                    </Button>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[48px] touch-manipulation">
                        List Your Space
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[48px] touch-manipulation text-left justify-start">
                        Login / Sign Up
                      </Button>
                    </Link>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[48px] touch-manipulation">
                        List Your Space
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <Link
                to="/find-a-parking-space"
                className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Parking Space
              </Link>
              
              {/* Mobile Zones Menu */}
              <div className="py-2">
                <p className="text-sm font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">Popular Zones</p>
                <div className="space-y-1">
                  <Link
                    to="/dubai-marina"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dubai Marina
                  </Link>
                  <Link
                    to="/downtown"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Downtown
                  </Link>
                  <Link
                    to="/palm-jumeirah"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Palm Jumeirah
                  </Link>
                  <Link
                    to="/business-bay"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Business Bay
                  </Link>
                  <Link
                    to="/difc"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    DIFC
                  </Link>
                  <Link
                    to="/deira"
                    className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deira
                  </Link>
                </div>
              </div>
              <Link
                to="/about-us"
                className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/news"
                className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/calculator"
                className="btn-3d block px-4 py-3 rounded-lg text-foreground hover:text-primary font-semibold text-base touch-manipulation min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Calculator
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
