import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * App-like bottom nav for mobile. Hidden on md+.
 * Pages should add `pb-mobile-nav` to their root container so content
 * isn't hidden behind it.
 *
 * Layout: [Home] [Parking Search] [List Your Parking] [Account]
 */
const MobileBottomNav = () => {
  const { pathname } = useLocation();
  let user: any = null;
  try {
    user = useAuth().user;
  } catch {
    user = null;
  }

  // Hide on admin to keep dashboard immersive
  if (pathname.startsWith("/admin")) return null;

  const items = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      match: (p: string) => p === "/",
    },
    {
      to: "/find-a-parking-space",
      label: "Search",
      icon: Search,
      match: (p: string) => p.startsWith("/find"),
    },
    {
      to: "/rent-out-your-space",
      label: "List",
      icon: Plus,
      match: (p: string) => p.startsWith("/rent-out"),
    },
    {
      to: user ? "/my-account" : "/auth",
      label: user ? "Account" : "Sign in",
      icon: User,
      match: (p: string) =>
        p.startsWith("/my-account") || p.startsWith("/auth"),
    },
  ];

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 pb-safe-area-bottom"
      role="navigation"
      aria-label="Primary mobile navigation"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      {/* Glassmorphism layer matching the rest of the site */}
      <div
        className="relative backdrop-blur-2xl border-t border-white/40"
        style={{
          background:
            "linear-gradient(180deg, hsl(160 55% 96% / 0.85) 0%, hsl(160 50% 92% / 0.78) 100%)",
          boxShadow:
            "0 -8px 24px -10px hsl(var(--primary) / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.7)",
        }}
      >
        <ul className="relative flex items-stretch justify-around h-[64px] px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <li key={item.label} className="flex-1">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-1 h-full text-[10.5px] font-bold transition-all touch-manipulation select-none",
                    active
                      ? "text-primary-deep"
                      : "text-foreground/60 active:text-primary-deep"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-br from-primary-glow to-primary text-white scale-110 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5),0_8px_18px_-4px_hsl(var(--primary)/0.55),0_2px_4px_-1px_hsl(var(--primary-deep)/0.35)]"
                        : "bg-white/60 backdrop-blur-md border border-white/70 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.9),0_2px_6px_-2px_hsl(var(--primary-deep)/0.15)] group-active:bg-white/90"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[20px] w-[20px] transition-transform",
                        active && "scale-110"
                      )}
                      strokeWidth={active ? 2.6 : 2.2}
                    />
                  </span>
                  <span className="leading-tight tracking-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
