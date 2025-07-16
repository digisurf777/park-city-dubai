import { Link } from "react-router-dom";
import { MapPin, Mail, Apple, Play } from "lucide-react";
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
              <p className="text-sm text-gray-400 font-medium">Coming Soon</p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 cursor-not-allowed opacity-60 w-24 h-16">
                  <svg className="h-5 w-5 text-gray-300 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 leading-none">Download on the</div>
                    <div className="text-xs font-medium text-gray-300 leading-none">App Store</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 cursor-not-allowed opacity-60 w-24 h-16">
                  <Play className="h-5 w-5 text-gray-300 mb-1" />
                  <div className="text-center">
                    <div className="text-xs text-gray-400 leading-none">Get IT ON</div>
                    <div className="text-xs font-medium text-gray-300 leading-none">Google Play</div>
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