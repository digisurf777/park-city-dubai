
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MapPin, Menu, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg pt-safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 touch-manipulation">
            <img 
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png" 
              alt="Shazam Parking" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/find-a-parking-space" className="text-gray-700 hover:text-primary transition-colors">
              Find a Parking Space
            </Link>
            
            {/* Zones Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-primary transition-colors bg-transparent">
                    Zones
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <div className="grid gap-1">
                        <Link 
                          to="/dubai-marina" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Dubai Marina
                        </Link>
                        <Link 
                          to="/downtown" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Downtown
                        </Link>
                        <Link 
                          to="/palm-jumeirah" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Palm Jumeirah
                        </Link>
                        <Link 
                          to="/business-bay" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Business Bay
                        </Link>
                        <Link 
                          to="/difc" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          DIFC
                        </Link>
                        <Link 
                          to="/deira" 
                          className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Deira
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
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
                <Link to="/rent-out-your-space">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    List Your Space
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary">
                    Login / Sign Up
                  </Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    List Your Space
                  </Button>
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
          <div className="md:hidden absolute top-16 left-0 right-0 backdrop-blur-md bg-white/95 border-b border-white/20 shadow-lg animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto mobile-scroll">
            <div className="px-4 py-6 space-y-2 pb-safe-area-bottom">
              <Link
                to="/find-a-parking-space"
                className="block text-gray-700 hover:text-primary transition-colors py-3 px-2 rounded-md touch-manipulation min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Parking Space
              </Link>
              
              {/* Mobile Zones Menu */}
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500 mb-2 px-2">Zones</p>
                <div className="pl-4 space-y-1">
                  <Link
                    to="/dubai-marina"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dubai Marina
                  </Link>
                  <Link
                    to="/downtown"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Downtown
                  </Link>
                  <Link
                    to="/palm-jumeirah"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Palm Jumeirah
                  </Link>
                  <Link
                    to="/business-bay"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Business Bay
                  </Link>
                  <Link
                    to="/difc"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    DIFC
                  </Link>
                  <Link
                    to="/deira"
                    className="block text-gray-700 hover:text-primary transition-colors py-2 px-2 rounded-md touch-manipulation min-h-[40px] flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deira
                  </Link>
                </div>
              </div>
              <Link
                to="/about-us"
                className="block text-gray-700 hover:text-primary transition-colors py-3 px-2 rounded-md touch-manipulation min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="block text-gray-700 hover:text-primary transition-colors py-3 px-2 rounded-md touch-manipulation min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/news"
                className="block text-gray-700 hover:text-primary transition-colors py-3 px-2 rounded-md touch-manipulation min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/calculator"
                className="block text-gray-700 hover:text-primary transition-colors py-3 px-2 rounded-md touch-manipulation min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Calculator
              </Link>
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <Link to="/my-account" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[44px] touch-manipulation">
                        <User className="mr-2 h-4 w-4" />
                        My Account
                      </Button>
                    </Link>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[44px] touch-manipulation">
                        List Your Space
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-gray-700 hover:text-primary min-h-[44px] touch-manipulation">
                        Login / Sign Up
                      </Button>
                    </Link>
                    <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white min-h-[44px] touch-manipulation">
                        List Your Space
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
