import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  const socials = [
    {
      href: "https://instagram.com/shazamparking",
      label: "Instagram",
      brand: "from-[#feda75] via-[#fa7e1e] to-[#d62976]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.81.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.81-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.81-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.81.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.78 2.2 12 2.2zm0 3.05a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3zm5.15-2.05a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z" />
        </svg>
      ),
    },
    {
      href: "https://facebook.com/shazamparking",
      label: "Facebook",
      brand: "from-[#1877f2] to-[#0a52c2]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
        </svg>
      ),
    },
    {
      href: "https://linkedin.com/company/shazam",
      label: "LinkedIn",
      brand: "from-[#0a66c2] to-[#0e4a8a]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      ),
    },
    {
      href: "https://x.com/shazamparking",
      label: "X",
      brand: "from-[#1f1f1f] to-[#000]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: "https://wa.me/971500000000",
      label: "WhatsApp",
      brand: "from-[#25d366] to-[#128c7e]",
      svg: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M17.47 14.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.86.51 3.6 1.4 5.1L2 22l4.99-1.37A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {socials.map(({ svg, href, label, brand }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="group relative h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/15 text-white hover:ring-white/30 transition-all overflow-hidden"
                >
                  <span
                    className={`absolute inset-0 bg-gradient-to-br ${brand} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    aria-hidden="true"
                  />
                  <span className="relative">{svg}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4">
              {quickLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + ecosystem link */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-3">
              Legal
            </h3>
            <ul className="space-y-1.5 mb-4">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="https://shazam.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
            >
              Part of the Shazam ecosystem
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
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
