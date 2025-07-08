
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MapPin, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png" 
              alt="Shazam Parking" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
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
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/my-account">
              <Button variant="ghost" className="text-gray-700 hover:text-primary">
                Login / Sign Up
              </Button>
            </Link>
            <Link to="/rent-out-your-space">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                List Your Space
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 backdrop-blur-md bg-white/90 border-b border-white/20 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/find-a-parking-space"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Parking Space
              </Link>
              
              {/* Mobile Zones Menu */}
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500 mb-2">Zones</p>
                <div className="pl-4 space-y-2">
                  <Link
                    to="/dubai-marina"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dubai Marina
                  </Link>
                  <Link
                    to="/downtown"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Downtown
                  </Link>
                  <Link
                    to="/palm-jumeirah"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Palm Jumeirah
                  </Link>
                  <Link
                    to="/business-bay"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Business Bay
                  </Link>
                  <Link
                    to="/difc"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    DIFC
                  </Link>
                  <Link
                    to="/deira"
                    className="block text-gray-700 hover:text-primary transition-colors py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deira
                  </Link>
                </div>
              </div>
              <Link
                to="/about-us"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/news"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <div className="pt-4 space-y-2">
                <Link to="/my-account">
                  <Button variant="ghost" className="w-full text-gray-700 hover:text-primary">
                    Login / Sign Up
                  </Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    List Your Space
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
