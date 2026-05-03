import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-[hsl(174_30%_8%)] text-white">
      {/* Top brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.png"
                alt="Shazam Parking"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 mt-4 mb-6 max-w-md leading-relaxed">
              Dubai's premier parking solution. Fixed prices and absolute convenience for all your parking needs.
            </p>
            <a
              href="mailto:support@shazam.ae"
              className="inline-flex items-center text-gray-200 bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <span>support@shazam.ae</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 inline-block border-b-2 border-primary/50 pb-1">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/find-a-parking-space", label: "Find Parking" },
                { to: "/rent-out-your-space", label: "List Your Space" },
                { to: "/about-us", label: "About" },
                { to: "/faq", label: "FAQ" },
                { to: "/calculator", label: "Calculator" },
                { to: "/news", label: "News" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-block text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 inline-block border-b-2 border-primary/50 pb-1">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/terms-and-conditions", label: "Terms & Conditions" },
                { to: "/cookies-notice", label: "Cookies Notice" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-block text-gray-300 hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App Store Downloads */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-primary/90 font-medium uppercase tracking-wide">Coming Soon</p>
              <div className="flex flex-col gap-3">
                {/* App Store Button */}
                <div className="flex items-center bg-black/60 border border-white/10 rounded-xl px-4 py-2 cursor-not-allowed opacity-80 hover:opacity-100 hover:bg-white/5 transition-all w-44">
                  <svg className="h-7 w-7 text-white mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                  <div>
                    <div className="text-[10px] text-gray-300 leading-none">Download on the</div>
                    <div className="text-base font-medium text-white leading-tight">App Store</div>
                  </div>
                </div>

                {/* Google Play Button */}
                <div className="flex items-center bg-black/60 border border-white/10 rounded-xl px-4 py-2 cursor-not-allowed opacity-80 hover:opacity-100 hover:bg-white/5 transition-all w-44">
                  <svg className="h-7 w-7 mr-3" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="playGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#5a67d8" />
                      </linearGradient>
                      <linearGradient id="playGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb347" />
                        <stop offset="100%" stopColor="#ffcc02" />
                      </linearGradient>
                      <linearGradient id="playGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff6b6b" />
                        <stop offset="100%" stopColor="#ee5a52" />
                      </linearGradient>
                      <linearGradient id="playGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c3ec52" />
                        <stop offset="100%" stopColor="#0ba360" />
                      </linearGradient>
                    </defs>
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z" fill="url(#playGradient3)" />
                    <path d="M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12Z" fill="url(#playGradient2)" />
                    <path d="M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z" fill="url(#playGradient4)" />
                    <path d="M21.96,11.59C21.96,12.09 21.76,12.59 21.36,12.79L18.15,14.12L15.75,12L18.15,9.88L21.36,11.21C21.76,11.41 21.96,11.91 21.96,12.41" fill="url(#playGradient1)" />
                  </svg>
                  <div>
                    <div className="text-[10px] text-gray-300 leading-none">GET IT ON</div>
                    <div className="text-base font-medium text-white leading-tight">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2026 ShazamParking.ae. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-gray-400 text-sm mt-4 md:mt-0">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Dubai, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
