import { cn } from "@/lib/utils";

/**
 * Branded skeleton block with shimmer.
 */
export const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("rounded-md skeleton-shimmer", className)} />
);

/**
 * Branded full-page loader (used in Suspense fallback).
 */
export const PageLoader = ({ label }: { label?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-subtle">
    <div className="relative">
      <div className="h-14 w-14 rounded-full bg-gradient-primary animate-pulse-glow" />
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
    {label && <p className="text-sm text-muted-foreground animate-fade-in">{label}</p>}
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
