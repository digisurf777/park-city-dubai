import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, User, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * App-like bottom nav for mobile. Hidden on md+.
 * Pages should add `pb-mobile-nav` to their root container so content
 * isn't hidden behind it.
 */
const MobileBottomNav = () => {
  const { pathname } = useLocation();
  let user: any = null;
  try {
    user = useAuth().user;
  } catch {
    user = null;
  }

  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { to: "/find-parking", label: "Search", icon: Search, match: (p: string) => p.startsWith("/find") },
    {
      to: "/rent-out-your-space",
      label: "List",
      icon: Plus,
      match: (p: string) => p.startsWith("/rent-out"),
      highlight: true,
    },
    {
      to: user ? "/contact-admin" : "/auth",
      label: "Inbox",
      icon: MessageCircle,
      match: (p: string) => p.startsWith("/contact-admin"),
    },
    {
      to: user ? "/my-account" : "/auth",
      label: user ? "Account" : "Sign in",
      icon: User,
      match: (p: string) => p.startsWith("/my-account") || p.startsWith("/auth"),
    },
  ];

  // Hide on admin to keep dashboard immersive
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/40 pb-safe-area-bottom"
      role="navigation"
      aria-label="Primary mobile navigation"
    >
      <ul className="flex items-stretch justify-around h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-medium transition-colors touch-manipulation",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.highlight ? (
                  <span
                    className={cn(
                      "flex items-center justify-center w-11 h-11 rounded-full -mt-4 shadow-3d transition-transform",
                      "bg-gradient-primary text-primary-foreground",
                      active ? "scale-110" : "hover:scale-105"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                ) : (
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      active && "scale-110"
                    )}
                  />
                )}
                <span className={cn(item.highlight && "mt-0")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
