import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, ExternalLink } from "lucide-react";
import dubaiLifeOs from "@/assets/ecosystem/dubai-life-os.jpg";
import dubaiLifeMaps from "@/assets/ecosystem/dubai-life-maps.jpg";
import shazamEcosystem from "@/assets/ecosystem/shazam-ecosystem.jpg";

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
                src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.webp"
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

            {/* Social icons - official brand glyphs */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {[
                {
                  href: "https://instagram.com/shazamparking",
                  label: "Instagram",
                  brand: "from-[#feda75] via-[#fa7e1e] to-[#d62976]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.81.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.81-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.81-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.81.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.78 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-.99.05-1.53.21-1.89.35-.47.18-.81.4-1.17.76-.36.36-.58.7-.76 1.17-.14.36-.3.9-.35 1.89C3.02 8.5 3 8.85 3 12s0 3.5.07 4.74c.05.99.21 1.53.35 1.89.18.47.4.81.76 1.17.36.36.7.58 1.17.76.36.14.9.3 1.89.35 1.24.07 1.59.07 4.74.07s3.5 0 4.74-.07c.99-.05 1.53-.21 1.89-.35.47-.18.81-.4 1.17-.76.36-.36.58-.7.76-1.17.14-.36.3-.9.35-1.89.07-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.05-.99-.21-1.53-.35-1.89-.18-.47-.4-.81-.76-1.17-.36-.36-.7-.58-1.17-.76-.36-.14-.9-.3-1.89-.35C15.5 4 15.15 4 12 4zm0 3.05a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3zm5.15-2.05a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z" />
                    </svg>
                  ),
                },
                {
                  href: "https://facebook.com/shazamparking",
                  label: "Facebook",
                  brand: "from-[#1877f2] to-[#0a52c2]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
                    </svg>
                  ),
                },
                {
                  href: "https://linkedin.com/company/shazam",
                  label: "LinkedIn",
                  brand: "from-[#0a66c2] to-[#0e4a8a]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                    </svg>
                  ),
                },
                {
                  href: "https://x.com/shazamparking",
                  label: "X",
                  brand: "from-[#1f1f1f] to-[#000]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  href: "https://tiktok.com/@shazamparking",
                  label: "TikTok",
                  brand: "from-[#25f4ee] via-[#0a0a0a] to-[#fe2c55]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.9a4.85 4.85 0 0 1-1.84-.21z" />
                    </svg>
                  ),
                },
                {
                  href: "https://wa.me/971500000000",
                  label: "WhatsApp",
                  brand: "from-[#25d366] to-[#128c7e]",
                  svg: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M17.47 14.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.86.51 3.6 1.4 5.1L2 22l4.99-1.37A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                  ),
                },
              ].map(({ svg, href, label, brand }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`group relative h-10 w-10 inline-flex items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/15 text-white hover:text-white hover:ring-white/30 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] transition-all overflow-hidden`}
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

        {/* Shazam Ecosystem strip */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] uppercase text-primary mb-2">
                Part of the Shazam Ecosystem
              </p>
              <h4 className="text-xl font-bold text-white">
                Built by{" "}
                <a
                  href="https://shazam.ae/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-glow underline-offset-4 hover:underline inline-flex items-center gap-1"
                >
                  Shazam <ExternalLink className="h-4 w-4" />
                </a>
              </h4>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              One ecosystem connecting city intelligence, life organisation and practical mobility in Dubai.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Shazam",
                subtitle: "Parent brand",
                href: "https://shazam.ae/",
                image: shazamEcosystem,
              },
              {
                title: "Dubai Life OS",
                subtitle: "Personal OS for Dubai",
                href: "https://dubailifeos.ae",
                image: dubaiLifeOs,
              },
              {
                title: "Dubai Life Maps",
                subtitle: "City intelligence map",
                href: "https://dubailifemaps.ae/",
                image: dubaiLifeMaps,
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-primary/40 hover:bg-white/10 transition-all"
              >
                <img
                  src={item.image}
                  alt={`${item.title} thumbnail`}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-primary/30 transition"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                    {item.title}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © 2026 ShazamParking.ae · A{" "}
            <a
              href="https://shazam.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-glow underline-offset-4 hover:underline"
            >
              Shazam
            </a>{" "}
            product. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Dubai, United Arab Emirates</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
