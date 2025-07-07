
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-lg">
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
            <Link to="/" className="text-white hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/pricing" className="text-white hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/listings" className="text-white hover:text-primary transition-colors">
              Listings
            </Link>
            <Link to="/contact" className="text-white hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/my-account" className="text-white hover:text-primary transition-colors">
              My Account
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-primary">
              Rent out your space
            </Button>
            <Button variant="ghost" className="text-white hover:text-primary">
              Find a parking space
            </Button>
            <Button variant="ghost" className="text-white hover:text-primary">
              About us
            </Button>
            <Button variant="ghost" className="text-white hover:text-primary">
              News
            </Button>
            <Button variant="ghost" className="text-white hover:text-primary">
              FAQ
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
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-800 border-b border-gray-700 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/how-it-works"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/listings"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Listings
              </Link>
              <Link
                to="/contact"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/my-account"
                className="block text-white hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
