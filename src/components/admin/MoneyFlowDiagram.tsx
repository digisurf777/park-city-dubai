import { ArrowRight, Wallet, Building2, Users, CreditCard } from 'lucide-react';

interface Props {
  bookingsTotal: number;
  preAuthTotal: number;
  payoutsTotal: number;
  platformMargin: number;
  currency?: string;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/**
 * Animated SVG money-flow diagram.
 * Bookings + Pre-auth → Revenue → splits to Owner Payouts and Platform Margin.
 */
export const MoneyFlowDiagram = ({
  bookingsTotal,
  preAuthTotal,
  payoutsTotal,
  platformMargin,
  currency = 'AED',
}: Props) => {
  return (
    <div className="relative w-full h-full min-h-[320px]">
      {/* Background SVG with animated paths */}
      <svg
        viewBox="0 0 600 320"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.95" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <filter id="flow-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Bookings -> Revenue (top-left to center) */}
        <path
          d="M 90 80 C 200 80, 220 160, 300 160"
          stroke="url(#flow-grad)"
          strokeWidth="3"
          fill="none"
          filter="url(#flow-glow)"
          className="flow-path flow-path-fast"
        />
        {/* Pre-auth -> Revenue (bottom-left to center) */}
        <path
          d="M 90 240 C 200 240, 220 160, 300 160"
          stroke="url(#flow-grad)"
          strokeWidth="3"
          fill="none"
          filter="url(#flow-glow)"
          className="flow-path flow-path-slow"
        />
        {/* Revenue -> Payouts (center to top-right) */}
        <path
          d="M 300 160 C 380 160, 400 80, 510 80"
          stroke="url(#flow-grad)"
          strokeWidth="3"
          fill="none"
          filter="url(#flow-glow)"
          className="flow-path"
        />
        {/* Revenue -> Platform Margin (center to bottom-right) */}
        <path
          d="M 300 160 C 380 160, 400 240, 510 240"
          stroke="url(#flow-grad)"
          strokeWidth="3"
          fill="none"
          filter="url(#flow-glow)"
          className="flow-path flow-path-fast"
        />
      </svg>

      {/* Node overlays */}
      <div className="absolute inset-0 grid grid-cols-3 items-center px-2 sm:px-4">
        {/* Left column: sources */}
        <div className="flex flex-col gap-3">
          <FlowNode
            icon={<CreditCard className="h-4 w-4" />}
            label="Bookings"
            value={fmt(bookingsTotal)}
            currency={currency}
            tone="primary"
          />
          <FlowNode
            icon={<Wallet className="h-4 w-4" />}
            label="Pre-auth holds"
            value={fmt(preAuthTotal)}
            currency={currency}
            tone="muted"
          />
        </div>

        {/* Center: revenue hub */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary-glow/30 blur-2xl animate-pulse" />
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full cosmic-ring bg-gradient-to-br from-primary via-primary-glow to-primary flex flex-col items-center justify-center text-white text-center shadow-[0_0_60px_hsl(var(--primary-glow)/0.6)]">
              <span className="text-[10px] uppercase tracking-widest text-white/80">Gross</span>
              <span className="text-base sm:text-lg font-black leading-none">
                {fmt(bookingsTotal + preAuthTotal)}
              </span>
              <span className="text-[10px] text-white/70 mt-0.5">{currency}</span>
            </div>
          </div>
        </div>

        {/* Right column: destinations */}
        <div className="flex flex-col gap-3 items-end">
          <FlowNode
            icon={<Users className="h-4 w-4" />}
            label="Owner payouts"
            value={fmt(payoutsTotal)}
            currency={currency}
            tone="muted"
            align="right"
          />
          <FlowNode
            icon={<Building2 className="h-4 w-4" />}
            label="Platform margin"
            value={fmt(platformMargin)}
            currency={currency}
            tone="success"
            align="right"
          />
        </div>
      </div>
    </div>
  );
};

interface NodeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  currency: string;
  tone?: 'primary' | 'success' | 'muted';
  align?: 'left' | 'right';
}

const FlowNode = ({ icon, label, value, currency, tone = 'primary', align = 'left' }: NodeProps) => {
  const toneClasses =
    tone === 'success'
      ? 'from-emerald-500/20 to-primary/10 border-emerald-400/40 text-emerald-300'
      : tone === 'muted'
      ? 'from-white/5 to-white/0 border-white/15 text-white/85'
      : 'from-primary/25 to-primary-glow/10 border-primary-glow/40 text-primary-foreground';

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${toneClasses} backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg min-w-[120px] sm:min-w-[140px] ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-90 ${align === 'right' ? 'justify-end' : ''}`}>
        {align === 'left' && icon}
        <span>{label}</span>
        {align === 'right' && icon}
      </div>
      <div className="mt-0.5 font-black text-base sm:text-lg leading-tight text-white">
        {value} <span className="text-[10px] font-medium text-white/60">{currency}</span>
      </div>
      <ArrowRight
        className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-primary-glow drop-shadow-[0_0_6px_hsl(var(--primary-glow))] ${
          align === 'right' ? '-left-5 rotate-180' : '-right-5'
        } hidden sm:block`}
      />
    </div>
  );
};

export default MoneyFlowDiagram;
