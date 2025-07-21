import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">About ShazamParking</h4>
            <p className="text-gray-400">
              ShazamParking is a platform that connects drivers with available parking spaces in Dubai, UAE.
              We aim to make parking easier and more convenient for everyone.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Search Parking
                </Link>
              </li>
              <li>
                <Link to="/list-your-space" className="hover:text-white transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <p className="text-gray-400">
              Address: Dubai, UAE
            </p>
            <p className="text-gray-400">
              Email: support@shazam.ae
            </p>
            <p className="text-gray-400">
              Phone: +971-50-123-4567
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook-square fa-2x"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter-square fa-2x"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram-square fa-2x"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookies-notice" className="text-gray-400 hover:text-white transition-colors">
              Cookies Notice
            </Link>
          </div>
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} ShazamParking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
