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
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-gradient-to-b from-primary-deep to-[hsl(160_75%_18%)] border-t border-primary-glow/30 shadow-[0_-12px_32px_-8px_hsl(var(--primary-deep)/0.55)] pb-safe-area-bottom"
      role="navigation"
      aria-label="Primary mobile navigation"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <div className="relative">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-glow/70 to-transparent" />

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
                    active ? "text-white" : "text-white/65 active:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                      active
                        ? "bg-gradient-to-br from-primary-glow to-primary text-white shadow-[inset_0_1px_0_hsl(0_0%_100%/0.35),0_4px_12px_-2px_hsl(var(--primary-glow)/0.55)] scale-105"
                        : "bg-white/5 group-active:bg-white/10"
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
                  <span
                    className={cn(
                      "absolute -top-px left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full transition-all",
                      active
                        ? "bg-primary-glow opacity-100 shadow-[0_0_10px_hsl(var(--primary-glow))]"
                        : "opacity-0"
                    )}
                  />
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
