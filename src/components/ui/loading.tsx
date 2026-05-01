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
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-surface via-background to-surface-2">
    <div className="relative h-24 w-24 flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-2xl animate-pulse-glow" />
      {/* Outer ring */}
      <div className="absolute inset-0 loader-ring" />
      {/* Inner counter-ring */}
      <div className="absolute inset-3 loader-ring-inner" />
      {/* Center dot */}
      <div className="relative h-3 w-3 rounded-full bg-gradient-primary shadow-glow" />
    </div>

    <div className="flex flex-col items-center gap-1">
      <p className="text-base font-bold tracking-[0.25em] uppercase text-gradient-primary">
        Shazam Parking
      </p>
      <p className="text-xs text-muted-foreground tracking-wider uppercase animate-fade-in">
        {label}
        <span className="inline-block animate-pulse">…</span>
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
