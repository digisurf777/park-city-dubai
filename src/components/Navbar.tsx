
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin, Menu, X, ChevronDown, User, Search, Building2,
  Info, HelpCircle, Newspaper, Calculator as CalcIcon,
  LogIn, LogOut, Sparkles, Home, Anchor, Landmark, Briefcase, Castle, Waves
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ZONE_PATHS = ["/dubai-marina", "/downtown", "/palm-jumeirah", "/business-bay", "/difc", "/deira"];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZonesOpen, setIsZonesOpen] = useState(false);
  const zonesRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;
  const isZonesActive = ZONE_PATHS.includes(pathname);

  // Shared link styles
  const linkBase = "relative px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5";
  const linkIdle = "text-slate-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-glow/10";
  const linkActive = "text-primary-deep bg-gradient-to-r from-primary/15 to-primary-glow/15 ring-1 ring-primary/25 shadow-[0_2px_10px_-4px_hsl(var(--primary)/0.35)]";
  const renderActiveBar = (active: boolean) =>
    active ? (
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-[3px] h-[2px] w-6 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
    ) : null;

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isMenuOpen]);

  // Click-outside + Escape to close zones dropdown
  useEffect(() => {
    if (!isZonesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (zonesRef.current && !zonesRef.current.contains(e.target as Node)) {
        setIsZonesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZonesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isZonesOpen]);

  // Add error boundary for auth hook
  let user, signOut;
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('Auth not ready in Navbar:', error);
    // Fallback values
    user = null;
    signOut = () => {};
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-primary/10 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.25)] pt-safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[60px]">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation min-h-[44px] min-w-[44px]" 
            onClick={() => {
              setIsMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src="/lovable-uploads/57b00db0-50ff-4536-a807-ccabcb57b49c.webp" 
              alt="Shazam Parking" 
              className="h-10 w-auto"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/find-a-parking-space"
              aria-current={isActive("/find-a-parking-space") ? "page" : undefined}
              className={cn(linkBase, isActive("/find-a-parking-space") ? linkActive : linkIdle)}
            >
              Find a Parking Space
              {renderActiveBar(isActive("/find-a-parking-space"))}
            </Link>

            {/* Zones Dropdown */}
            <div className="relative" ref={zonesRef}>
              <button
                onClick={() => setIsZonesOpen(!isZonesOpen)}
                aria-expanded={isZonesOpen}
                aria-haspopup="menu"
                className={cn(
                  linkBase,
                  "flex items-center gap-1",
                  isZonesOpen || isZonesActive ? linkActive : linkIdle
                )}
              >
                Zones
                <ChevronDown className={cn("h-4 w-4 transition-transform", isZonesOpen && "rotate-180")} />
                {renderActiveBar(isZonesActive)}
              </button>
              {isZonesOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_hsl(var(--primary-deep)/0.4),0_8px_16px_-8px_hsl(var(--primary)/0.3)] ring-1 ring-primary/15 z-50 animate-scale-in origin-top overflow-hidden"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-bold px-4 pt-3 pb-1.5">
                    Choose a Zone
                  </p>
                  <div className="p-2 pt-1 space-y-0.5">
                    {[
                      { to: "/dubai-marina", label: "Dubai Marina", icon: Anchor },
                      { to: "/downtown", label: "Downtown", icon: Building2 },
                      { to: "/palm-jumeirah", label: "Palm Jumeirah", icon: Waves },
                      { to: "/business-bay", label: "Business Bay", icon: Briefcase },
                      { to: "/difc", label: "DIFC", icon: Landmark },
                      { to: "/deira", label: "Deira", icon: Castle },
                    ].map((z) => {
                      const active = isActive(z.to);
                      return (
                        <Link
                          key={z.to}
                          to={z.to}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          onClick={() => setIsZonesOpen(false)}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all",
                            active
                              ? "bg-gradient-to-r from-primary/15 to-primary-glow/15 text-primary-deep ring-1 ring-primary/20"
                              : "text-slate-800 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary-glow/10 hover:text-primary"
                          )}
                        >
                          <span className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shadow-sm",
                            active
                              ? "bg-gradient-to-br from-primary to-primary-glow text-white"
                              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                          )}>
                            <z.icon className="h-4 w-4" strokeWidth={2.2} />
                          </span>
                          <span className="flex-1">{z.label}</span>
                          <ChevronDown className={cn(
                            "h-3.5 w-3.5 -rotate-90 text-primary transition-opacity",
                            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {[
              { to: "/about-us", label: "About Us" },
              { to: "/faq", label: "FAQ" },
              { to: "/news", label: "News" },
              { to: "/calculator", label: "Calculator" },
            ].map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(linkBase, active ? linkActive : linkIdle)}
                >
                  {item.label}
                  {renderActiveBar(active)}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link to="/my-account">
                  <button
                    aria-current={isActive("/my-account") ? "page" : undefined}
                    className={cn(
                      "group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5",
                      isActive("/my-account")
                        ? "bg-gradient-to-r from-primary to-primary-glow text-white ring-1 ring-primary/40 shadow-[0_8px_22px_-8px_hsl(var(--primary)/0.65)]"
                        : "bg-white/80 backdrop-blur ring-1 ring-primary/25 text-primary-deep hover:ring-primary/55 hover:bg-white shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.35)]"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-full shadow-inner",
                      isActive("/my-account")
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-br from-primary to-primary-glow text-white"
                    )}>
                      <User className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    My Account
                  </button>
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-semibold text-sm border border-primary/30 text-primary-deep hover:bg-primary/8 hover:border-primary/60 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
                <Link to="/rent-out-your-space">
                  <button className="btn-3d-primary px-5 py-2 rounded-full font-semibold text-sm tracking-wide">
                    List Your Space
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm bg-primary/8 ring-1 ring-primary/25 text-primary-deep hover:bg-primary/15 hover:ring-primary/45 transition-all duration-200 hover:-translate-y-0.5">
                    <LogIn className="h-3.5 w-3.5" />
                    Login / Sign Up
                  </button>
                </Link>
                <Link to="/rent-out-your-space">
                  <button className="btn-3d-primary px-5 py-2 rounded-full font-semibold text-sm tracking-wide">
                    List Your Space
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Premium Full-Screen Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 top-16 z-30 bg-black/60 backdrop-blur-md animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <div
              className="md:hidden fixed top-16 left-0 right-0 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto mobile-scroll animate-slide-up"
              role="dialog"
              aria-modal="true"
            >
              <div className="relative bg-white border-b border-primary/20 shadow-[0_30px_60px_-20px_hsl(var(--primary-deep)/0.55)] rounded-b-3xl overflow-hidden">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 bg-primary-glow/15 rounded-full blur-3xl" />

                <div className="relative px-5 pt-5 pb-8 space-y-6 pb-safe-area-bottom">

                  {/* Auth section / Profile card */}
                  <div className="space-y-2.5">
                    {user ? (
                      <>
                        <Link to="/my-account" onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20 shadow-sm active:scale-[0.99] transition-transform">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center text-white shadow-md">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">My Account</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 -rotate-90 text-primary" />
                          </div>
                        </Link>
                        <div className="grid grid-cols-2 gap-2.5">
                          <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                            <button className="btn-3d-primary w-full px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2">
                              <Sparkles className="h-4 w-4" /> List Space
                            </button>
                          </Link>
                          <button
                            onClick={() => { setIsMenuOpen(false); signOut(); }}
                            className="w-full px-4 py-3 rounded-xl font-semibold text-sm border border-border bg-white hover:bg-muted text-foreground flex items-center justify-center gap-2 transition-colors"
                          >
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                          <button className="w-full px-4 py-3 rounded-xl font-semibold text-sm border border-primary/30 bg-white text-foreground hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors">
                            <LogIn className="h-4 w-4" /> Sign In
                          </button>
                        </Link>
                        <Link to="/rent-out-your-space" onClick={() => setIsMenuOpen(false)}>
                          <button className="btn-3d-primary w-full px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4" /> List Space
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Discover */}
                  <div>
                    <p className="text-[11px] font-bold text-primary/70 mb-2.5 px-1 uppercase tracking-[0.15em]">Discover</p>
                    <div className="rounded-2xl bg-white border border-border shadow-md overflow-hidden divide-y divide-border/40">
                      {[
                        { to: "/find-a-parking-space", label: "Find a Parking Space", icon: Search, accent: true },
                        { to: "/calculator", label: "Earnings Calculator", icon: CalcIcon },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 active:bg-primary/5 transition-colors min-h-[52px]"
                        >
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${item.accent ? 'bg-gradient-to-br from-primary to-primary-deep text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
                            <item.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                          </div>
                          <span className="flex-1 font-semibold text-sm text-foreground">{item.label}</span>
                          <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Zones */}
                  <div>
                    <p className="text-[11px] font-bold text-primary/70 mb-2.5 px-1 uppercase tracking-[0.15em]">Popular Zones</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { to: "/dubai-marina", label: "Dubai Marina", icon: Anchor },
                        { to: "/downtown", label: "Downtown", icon: Building2 },
                        { to: "/palm-jumeirah", label: "Palm Jumeirah", icon: Waves },
                        { to: "/business-bay", label: "Business Bay", icon: Briefcase },
                        { to: "/difc", label: "DIFC", icon: Landmark },
                        { to: "/deira", label: "Deira", icon: Castle },
                      ].map((z) => (
                        <Link
                          key={z.to}
                          to={z.to}
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex flex-col items-start gap-2 p-3 rounded-xl bg-white border border-border hover:border-primary/40 active:scale-[0.97] transition-all shadow-md"
                        >
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary-glow/15 flex items-center justify-center text-primary group-active:from-primary group-active:to-primary-deep group-active:text-white transition-colors">
                            <z.icon className="h-4 w-4" strokeWidth={2.2} />
                          </div>
                          <span className="text-xs font-bold text-foreground leading-tight">{z.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <p className="text-[11px] font-bold text-primary/70 mb-2.5 px-1 uppercase tracking-[0.15em]">Company</p>
                    <div className="rounded-2xl bg-white border border-border shadow-md overflow-hidden divide-y divide-border/40">
                      {[
                        { to: "/about-us", label: "About Us", icon: Info },
                        { to: "/faq", label: "FAQ", icon: HelpCircle },
                        { to: "/news", label: "News & Updates", icon: Newspaper },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 active:bg-primary/5 transition-colors min-h-[52px]"
                        >
                          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <item.icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                          </div>
                          <span className="flex-1 font-semibold text-sm text-foreground">{item.label}</span>
                          <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Footer hint */}
                  <p className="text-center text-[11px] text-muted-foreground pt-2">
                    Trusted Parking Platform · Dubai, UAE
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
