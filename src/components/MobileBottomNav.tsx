import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, Headset } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * App-like bottom nav for mobile. Hidden on md+.
 * Pages should add `pb-mobile-nav` to their root container so content
 * isn't hidden behind it.
 *
 * Layout: [Home] [Search] [List (raised 3D CTA)] [Support] [Account]
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

  const leftItems = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    {
      to: "/find-a-parking-space",
      label: "Search",
      icon: Search,
      match: (p: string) => p.startsWith("/find"),
    },
  ];

  const rightItems = [
    {
      // Trigger ChatWidget by dispatching a global event handled in ChatWidget
      to: "#support",
      label: "Support",
      icon: Headset,
      match: (_p: string) => false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-support-chat"));
      },
    },
    {
      to: user ? "/my-account" : "/auth",
      label: user ? "Account" : "Sign in",
      icon: User,
      match: (p: string) =>
        p.startsWith("/my-account") || p.startsWith("/auth"),
    },
  ];

  const renderItem = (item: {
    to: string;
    label: string;
    icon: any;
    match: (p: string) => boolean;
    onClick?: (e: React.MouseEvent) => void;
  }) => {
    const Icon = item.icon;
    const active = item.match(pathname);
    const isSupport = item.label === "Support";
    return (
      <li key={item.label} className="flex-1">
        <Link
          to={item.to}
          onClick={item.onClick}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-0.5 h-full text-[10.5px] font-bold transition-all touch-manipulation select-none",
            active
              ? "text-primary"
              : "text-slate-700 active:text-primary"
          )}
        >
          <span
            className={cn(
              "relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all",
              active
                ? "bg-gradient-to-br from-primary/20 to-primary-glow/15 shadow-[inset_0_1px_0_hsl(var(--primary)/0.3),0_4px_10px_-2px_hsl(var(--primary)/0.4)] scale-105"
                : "bg-slate-100/80 group-active:bg-primary/10 group-hover:bg-primary/10"
            )}
          >
            <Icon
              className={cn(
                "h-[20px] w-[20px] transition-transform",
                active && "scale-110"
              )}
              strokeWidth={active ? 2.6 : 2.2}
            />
            {/* Live dot for support */}
            {isSupport && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </span>
          <span className="leading-tight tracking-tight">{item.label}</span>
          {/* Active dot */}
          <span
            className={cn(
              "block h-1 w-1 rounded-full transition-all",
              active ? "bg-primary opacity-100" : "opacity-0"
            )}
          />
        </Link>
      </li>
    );
  };

  const listActive = pathname.startsWith("/rent-out");

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/97 backdrop-blur-xl border-t border-primary/15 shadow-[0_-10px_28px_-8px_hsl(var(--primary-deep)/0.22)] pb-safe-area-bottom"
      role="navigation"
      aria-label="Primary mobile navigation"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      {/* Solid frosted bar */}
      <div className="relative">
        {/* Subtle top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <ul className="relative flex items-stretch justify-around h-16 px-1.5">
          {leftItems.map(renderItem)}

          {/* Center "List" CTA — same height as siblings, premium gradient */}
          <li className="flex-1">
            <Link
              to="/rent-out-your-space"
              aria-current={listActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-0.5 h-full text-[10.5px] font-bold transition-all touch-manipulation select-none",
                listActive ? "text-primary" : "text-slate-700"
              )}
            >
              <span
                className={cn(
                  "relative flex items-center justify-center w-11 h-11 rounded-2xl text-white transition-all",
                  "bg-gradient-to-br from-primary-glow via-primary to-primary-deep",
                  "shadow-[0_3px_0_0_hsl(var(--primary-deep)/0.45),0_6px_14px_-4px_hsl(var(--primary)/0.5)]",
                  "ring-1 ring-white/40",
                  "active:translate-y-0.5 active:shadow-[0_1px_0_0_hsl(var(--primary-deep)/0.4),0_3px_8px_-2px_hsl(var(--primary)/0.4)]",
                  listActive && "scale-105"
                )}
              >
                <span className="absolute inset-x-1.5 top-1 h-2.5 rounded-t-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                <Plus className="h-[22px] w-[22px] relative" strokeWidth={2.6} />
              </span>
              <span className="leading-tight tracking-tight">List</span>
              <span
                className={cn(
                  "block h-1 w-1 rounded-full transition-all",
                  listActive ? "bg-primary opacity-100" : "opacity-0"
                )}
              />
            </Link>
          </li>

          {rightItems.map(renderItem)}
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
