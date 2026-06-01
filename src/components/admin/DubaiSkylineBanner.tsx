import { ReactNode } from 'react';
import dubaiPhoto from '@/assets/dubai-business-bay-skyline.jpg';

interface Props {
  children: ReactNode;
  className?: string;
  /** Add extra vertical breathing room (used on the boss dashboard) */
  tall?: boolean;
  /** Round only bottom corners — useful when stacked under another element */
  flatTop?: boolean;
}

/**
 * Premium Dubai-themed hero banner used on the admin dashboard.
 * Uses a real Business Bay night photo with a brand gradient overlay
 * for legibility. Children are rendered on top.
 */
export function DubaiSkylineBanner({
  children,
  className = '',
  tall = false,
  flatTop = false,
}: Props) {
  const radius = flatTop
    ? 'rounded-b-2xl sm:rounded-b-3xl rounded-t-none border-t-0'
    : 'rounded-2xl sm:rounded-3xl';
  return (
    <div
      className={`relative overflow-hidden border border-primary/30 ${radius} ${className}`}
      style={{
        boxShadow:
          '0 30px 80px -30px hsl(var(--primary) / 0.55), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)',
        minHeight: tall ? 280 : undefined,
      }}
    >
      {/* Background photo */}
      <img
        src={dubaiPhoto}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Brand-tinted gradient for legibility — lighter so the skyline shows through */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--primary-deep, var(--primary)) / 0.78) 0%, hsl(var(--primary) / 0.45) 45%, hsl(var(--primary-deep, var(--primary)) / 0.35) 75%, rgba(7,17,31,0.55) 100%)',
        }}
      />
      {/* Subtle dark vignette anchoring text on the left */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 18% 35%, rgba(0,0,0,0.35) 0%, transparent 55%)',
        }}
      />
      {/* Top sheen */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, hsl(0 0% 100% / 0.10), transparent)',
        }}
      />
      {/* Bottom warm desert glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, hsl(40 90% 55% / 0.22), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

export default DubaiSkylineBanner;
