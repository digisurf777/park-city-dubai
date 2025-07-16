import { Link } from "react-router-dom";
import { MapPin, Mail } from "lucide-react";
const Footer = () => {
  return <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png" alt="Shazam Parking" className="h-10 w-auto" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Dubai's premier parking solution. Fixed prices and absolute convenience for all your parking needs.
            </p>
            <div className="flex items-center text-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              <span>support@shazam.ae</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/find-a-parking-space" className="text-gray-300 hover:text-primary transition-colors">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link to="/rent-out-your-space" className="text-gray-300 hover:text-primary transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-300 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact-admin" className="text-gray-300 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-primary transition-colors">
                  Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://shazamparking.ae/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://shazamparking.ae/terms-and-conditions/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                  Terms of Conditions
                </a>
              </li>
              <li>
                <a href="https://shazamparking.ae/cookies-notice/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                  Cookies Notice
                </a>
              </li>
            </ul>
            
            {/* App Store Downloads */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-400 font-medium">Download Our App</p>
              <div className="flex gap-2">
                <div className="flex items-center justify-center bg-gray-800 border border-gray-700 rounded-md px-2 py-2 cursor-not-allowed opacity-60 w-20 h-12">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Coming Soon</div>
                    <div className="text-xs font-medium text-gray-300">App Store</div>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-gray-800 border border-gray-700 rounded-md px-2 py-2 cursor-not-allowed opacity-60 w-20 h-12">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Coming Soon</div>
                    <div className="text-xs font-medium text-gray-300">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2022 ShazamParking.ae. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-gray-400 text-sm mt-4 md:mt-0">
            <MapPin className="h-4 w-4" />
            <span>Dubai, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;