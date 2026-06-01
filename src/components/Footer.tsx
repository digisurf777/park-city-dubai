import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, ExternalLink, Apple, Smartphone } from "lucide-react";

const Footer = () => {
  const socials = [
    {
      href: "https://www.facebook.com/shazamparking/",
      label: "Facebook",
      brand: "from-[#1877f2] to-[#0a52c2]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { to: "/find-a-parking-space", label: "Find Parking" },
    { to: "/rent-out-your-space", label: "List Your Space" },
    { to: "/about-us", label: "About" },
    { to: "/faq", label: "FAQ" },
    { to: "/calculator", label: "Calculator" },
  ];

  const legalLinks = [
    { to: "/privacy-policy", label: "Privacy" },
    { to: "/terms-and-conditions", label: "Terms" },
    { to: "/cookies-notice", label: "Cookies" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-[hsl(174_30%_8%)] text-white">
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary" />

      {/* ============ MOBILE - compact ============ */}
      <div className="md:hidden max-w-7xl mx-auto px-5 py-6">
        {/* Brand row */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.webp"
              alt="Shazam Parking"
              className="h-7 w-auto"
            />
          </Link>
          <a
            href="mailto:support@shazam.ae"
            className="inline-flex items-center text-[11px] text-gray-300 bg-white/5 px-2.5 py-1 rounded-full ring-1 ring-white/10"
          >
            <Mail className="h-3 w-3 mr-1 text-primary" />
            Contact
          </a>
        </div>

        {/* Compact link grid */}
        <ul className="grid grid-cols-3 gap-x-3 gap-y-1.5 mb-4">
          {[...quickLinks, ...legalLinks].map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="text-[12px] text-gray-300 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Socials - compact row */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {socials.map(({ svg, href, label, brand }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={`group h-8 w-8 inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${brand} text-white ring-1 ring-white/15`}
            >
              <span className="relative [&>svg]:h-[14px] [&>svg]:w-[14px]">{svg}</span>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-gray-500">
          <span>© 2026 ShazamParking.ae</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            Dubai, UAE
          </span>
        </div>
      </div>

      {/* ============ DESKTOP - full ============ */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Brand + contact */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.webp"
                alt="Shazam Parking"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm mt-3 mb-3 max-w-xs leading-relaxed">
              Dubai's premier parking marketplace. Fixed prices, verified owners.
            </p>
            <a
              href="mailto:support@shazam.ae"
              className="inline-flex items-center text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-full ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" />
              support@shazam.ae
            </a>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {socials.map(({ svg, href, label, brand }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`group relative h-10 w-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${brand} text-white ring-1 ring-white/20 shadow-[0_6px_14px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-110 hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent opacity-70" />
                  <span className="relative [&>svg]:h-[18px] [&>svg]:w-[18px]">{svg}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">Explore</h3>
            <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-300 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">Legal</h3>
            <ul className="space-y-1.5">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-300 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ecosystem + Apps */}
        <div className="border-t border-white/10 mt-6 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">Shazam Ecosystem</h3>
            <div className="flex flex-wrap gap-2">
              <a href="https://shazam.ae/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-200 bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-colors">
                Shazam <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://dubailifeos.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-200 bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-colors">
                Dubai Life OS <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://dubailifemaps.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gray-200 bg-white/5 px-3 py-1.5 rounded-full ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-colors">
                Dubai Life Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="md:text-right">
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">Mobile Apps</h3>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-gray-300 cursor-not-allowed" title="Coming soon">
                <Apple className="h-4 w-4" />
                <div className="leading-tight text-left">
                  <div className="text-[9px] uppercase tracking-wider text-gray-500">Coming soon</div>
                  <div className="text-xs font-semibold">App Store</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-gray-300 cursor-not-allowed" title="Coming soon">
                <Smartphone className="h-4 w-4" />
                <div className="leading-tight text-left">
                  <div className="text-[9px] uppercase tracking-wider text-gray-500">Coming soon</div>
                  <div className="text-xs font-semibold">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-xs text-center sm:text-left">
            © 2026 ShazamParking.ae · A Shazam product. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Dubai, UAE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
