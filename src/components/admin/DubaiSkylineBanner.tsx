import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Premium Dubai-themed hero banner used on the admin dashboard.
 * Layered SVG skyline (Burj Khalifa + Marina towers) over a deep
 * gradient with subtle stars and a golden desert glow at the bottom.
 * Children are rendered in a frosted glass overlay on top.
 */
export function DubaiSkylineBanner({ children, className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-primary/30 ${className}`}
      style={{
        background:
          'radial-gradient(ellipse at 20% 0%, hsl(var(--primary-glow) / 0.35), transparent 55%),' +
          'radial-gradient(ellipse at 80% 100%, hsl(40 95% 55% / 0.18), transparent 50%),' +
          'linear-gradient(160deg, hsl(var(--primary-deep, var(--primary))) 0%, hsl(var(--primary)) 45%, #07111f 100%)',
        boxShadow:
          '0 30px 80px -30px hsl(var(--primary) / 0.55), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)',
      }}
    >
      {/* Stars */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 12% 18%, white, transparent 60%),' +
            'radial-gradient(1px 1px at 28% 32%, white, transparent 60%),' +
            'radial-gradient(1.5px 1.5px at 45% 12%, white, transparent 60%),' +
            'radial-gradient(1px 1px at 62% 28%, white, transparent 60%),' +
            'radial-gradient(1px 1px at 78% 14%, white, transparent 60%),' +
            'radial-gradient(1.5px 1.5px at 88% 36%, white, transparent 60%),' +
            'radial-gradient(1px 1px at 36% 8%, white, transparent 60%),' +
            'radial-gradient(1px 1px at 8% 40%, white, transparent 60%)',
        }}
      />

      {/* Skyline silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 w-full h-[55%] opacity-90"
      >
        <defs>
          <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-deep, var(--primary)))" stopOpacity="0.0" />
            <stop offset="40%" stopColor="#020617" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="cityFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(40 95% 60%)" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Back layer - Marina-style towers */}
        <path
          fill="url(#city)"
          d="M0,220 L0,150 L40,150 L40,120 L70,120 L70,90 L95,90 L95,135 L130,135 L130,100 L160,100 L160,140 L195,140 L195,80 L215,80 L215,160 L250,160 L250,110 L285,110 L285,150 L320,150 L320,95 L355,95 L355,145 L390,145 L390,120 L420,120 L420,170 L460,170 L460,130 L500,130 L500,160 L540,160 L540,220 Z"
        />
        {/* Burj Khalifa centerpiece */}
        <path
          fill="url(#cityFront)"
          d="M580,220 L580,150 L585,150 L585,130 L590,130 L590,100 L595,100 L595,70 L600,70 L600,30 L605,5 L610,30 L610,70 L615,70 L615,100 L620,100 L620,130 L625,130 L625,150 L630,150 L630,220 Z"
        />
        {/* Right side towers */}
        <path
          fill="url(#city)"
          d="M650,220 L650,140 L685,140 L685,100 L720,100 L720,150 L755,150 L755,115 L790,115 L790,160 L825,160 L825,90 L860,90 L860,145 L895,145 L895,125 L930,125 L930,165 L970,165 L970,130 L1005,130 L1005,155 L1045,155 L1045,105 L1080,105 L1080,150 L1120,150 L1120,170 L1160,170 L1160,140 L1200,140 L1200,220 Z"
        />

        {/* Window lights */}
        <g fill="url(#windowGlow)" opacity="0.85">
          {Array.from({ length: 28 }).map((_, i) => {
            const x = 60 + (i * 41) % 1140;
            const y = 110 + ((i * 23) % 80);
            return <rect key={i} x={x} y={y} width="2" height="2" rx="0.5" />;
          })}
          {/* Burj Khalifa lit windows */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={`b-${i}`} x={597 + (i % 2) * 6} y={60 + i * 10} width="2" height="2" rx="0.5" />
          ))}
        </g>
      </svg>

      {/* Bottom desert glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(40 90% 55% / 0.18), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

export default DubaiSkylineBanner;
