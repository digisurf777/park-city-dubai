import { cn } from "@/lib/utils";

/**
 * Branded skeleton block with shimmer.
 */
export const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("rounded-md skeleton-shimmer", className)} />
);

/**
 * Premium full-page loader (used in Suspense fallback).
 * Dual concentric spinner rings with brand glow + shimmering wordmark.
 */
export const PageLoader = ({ label = "Loading" }: { label?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-surface via-background to-surface-2 relative overflow-hidden">
    {/* Ambient luxury glows */}
    <div className="pointer-events-none absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
    <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] rounded-full bg-primary-glow/15 blur-3xl animate-pulse-glow" style={{ animationDelay: "0.8s" }} />

    {/* Logo with halo */}
    <div className="relative h-32 w-32 flex items-center justify-center">
      {/* Pulsing halo */}
      <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-40 blur-2xl animate-pulse-glow" />
      {/* Outer rotating ring */}
      <div className="absolute inset-0 loader-ring" />
      {/* Inner counter-rotating ring */}
      <div className="absolute inset-4 loader-ring-inner" />
      {/* Glass disc with logo */}
      <div className="relative h-16 w-16 rounded-full bg-white/80 backdrop-blur-md shadow-elegant ring-1 ring-primary/30 flex items-center justify-center">
        <img
          src="/lovable-uploads/logo.webp"
          alt="Shazam Parking"
          className="h-10 w-10 object-contain animate-float"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>

    {/* Wordmark */}
    <div className="relative flex flex-col items-center gap-2">
      <p className="text-lg font-black tracking-[0.35em] uppercase text-gradient-primary drop-shadow-sm">
        Shazam Parking
      </p>
      {/* Animated progress bar */}
      <div className="relative h-[3px] w-44 overflow-hidden rounded-full bg-primary/10">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_1.6s_linear_infinite]" style={{ backgroundSize: "200% 100%" }} />
      </div>
      <p className="text-[10px] text-muted-foreground tracking-[0.4em] uppercase mt-1">
        {label}
      </p>
    </div>
  </div>
);

/**
 * Card skeleton list (for booking/listing grids while loading).
 */
export const CardListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border/60 p-4 space-y-3 bg-card">
        <Shimmer className="h-32 w-full" />
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-8 w-20" />
        </div>
      </div>
    ))}
  </div>
);
