
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X } from "lucide-react";
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
            <Link to="/rent-out-your-space" className="text-gray-700 hover:text-primary transition-colors">
              Rent out your space
            </Link>
            <Link to="/find-a-parking-space" className="text-gray-700 hover:text-primary transition-colors">
              Find a parking space
            </Link>
            <Link to="/my-account" className="text-gray-700 hover:text-primary transition-colors">
              My account
            </Link>
            <Link to="/about-us" className="text-gray-700 hover:text-primary transition-colors">
              About us
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-primary transition-colors">
              News
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-primary transition-colors">
              FAQ
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700 hover:text-primary">
              Sign In
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Sign Up
            </Button>
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
                to="/rent-out-your-space"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Rent out your space
              </Link>
              <Link
                to="/find-a-parking-space"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a parking space
              </Link>
              <Link
                to="/my-account"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My account
              </Link>
              <Link
                to="/about-us"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
              <Link
                to="/news"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                News
              </Link>
              <Link
                to="/faq"
                className="block text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full text-gray-700 hover:text-primary">
                  Sign In
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
