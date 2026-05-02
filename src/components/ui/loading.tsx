import { cn } from "@/lib/utils";

/**
 * Branded skeleton block with shimmer.
 */
export const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("rounded-md skeleton-shimmer", className)} />
);

/**
 * Premium full-page loader (Apple-style minimal).
 * Clean monochrome spinner + subtle wordmark — no clutter.
 */
export const PageLoader = ({ label = "Loading" }: { label?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
    {/* Apple-style minimalist spinner */}
    <div className="apple-spinner" aria-label={label} role="status">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{ transform: `rotate(${i * 30}deg)`, animationDelay: `${(i - 12) * 0.083}s` }} />
      ))}
    </div>

    {/* Quiet wordmark */}
    <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/80">
      {label}
    </p>
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
