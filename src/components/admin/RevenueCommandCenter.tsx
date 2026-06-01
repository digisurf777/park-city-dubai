import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity,
  TrendingUp,
  Wallet,
  Building2,
  Sparkles,
  Radio,
  CreditCard,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';
import { MoneyFlowDiagram } from './MoneyFlowDiagram';
import { useCurrency } from '@/contexts/CurrencyContext';
import CurrencySwitcher from './CurrencySwitcher';

type Period = '7d' | '30d' | '90d' | 'all';

interface BookingRow {
  id: string;
  cost_aed: number;
  payment_status: string | null;
  status: string;
  zone: string;
  created_at: string;
}

interface PayoutRow {
  id: string;
  amount_aed: number;
  payment_date: string;
}

interface PulseEvent {
  id: string;
  kind: 'booking' | 'payout' | 'preauth';
  amount: number;
  label: string;
  at: Date;
}

const periodDays: Record<Period, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

const fmtAed = (n: number) => Math.round(n).toLocaleString('en-US');

export const RevenueCommandCenter = () => {
  const [period, setPeriod] = useState<Period>('30d');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [pulse, setPulse] = useState<PulseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const { convert, symbol, currency } = useCurrency();

  const sinceISO = useMemo(() => {
    const days = periodDays[period];
    if (days === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let bq = supabase
        .from('parking_bookings')
        .select('id,cost_aed,payment_status,status,zone,created_at')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (sinceISO) bq = bq.gte('created_at', sinceISO);

      let pq = supabase
        .from('owner_payments')
        .select('id,amount_aed,payment_date')
        .order('payment_date', { ascending: false })
        .limit(1000);
      if (sinceISO) pq = pq.gte('payment_date', sinceISO);

      const [{ data: b }, { data: p }] = await Promise.all([bq, pq]);
      setBookings((b || []) as BookingRow[]);
      setPayouts((p || []) as PayoutRow[]);
      setLastSync(new Date());
    } catch (e) {
      console.error('Revenue fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Realtime pulse subscription
  useEffect(() => {
    const channel = supabase
      .channel('revenue-pulse')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_bookings' },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row) return;
          const isPreAuth = row.payment_status === 'pre_authorized';
          const ev: PulseEvent = {
            id: `${row.id}-${Date.now()}`,
            kind: isPreAuth ? 'preauth' : 'booking',
            amount: Number(row.cost_aed || 0),
            label: isPreAuth
              ? `Pre-auth held in ${row.zone || 'Dubai'}`
              : `Booking ${row.status} in ${row.zone || 'Dubai'}`,
            at: new Date(),
          };
          setPulse((prev) => [ev, ...prev].slice(0, 12));
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'owner_payments' },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          const ev: PulseEvent = {
            id: `${row.id}-${Date.now()}`,
            kind: 'payout',
            amount: Number(row.amount_aed || 0),
            label: 'Payout sent to owner',
            at: new Date(),
          };
          setPulse((prev) => [ev, ...prev].slice(0, 12));
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ KPIs ============
  const grossRevenue = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            b.payment_status === 'paid' ||
            b.payment_status === 'confirmed' ||
            b.payment_status === 'pre_authorized'
        )
        .filter((b) => b.status !== 'cancelled')
        .reduce((s, b) => s + Number(b.cost_aed || 0), 0),
    [bookings]
  );
  const preAuthHeld = useMemo(
    () =>
      bookings
        .filter((b) => b.payment_status === 'pre_authorized' && b.status !== 'cancelled')
        .reduce((s, b) => s + Number(b.cost_aed || 0), 0),
    [bookings]
  );
  const payoutsTotal = useMemo(
    () => payouts.reduce((s, p) => s + Number(p.amount_aed || 0), 0),
    [payouts]
  );
  const platformMargin = Math.max(0, grossRevenue - payoutsTotal);
  const marginPct = grossRevenue > 0 ? Math.min(100, (platformMargin / grossRevenue) * 100) : 0;

  // This-period vs previous-period delta
  const delta = useMemo(() => {
    const days = periodDays[period];
    if (!days) return 0;
    const halfMs = (days * 24 * 60 * 60 * 1000) / 2;
    const mid = Date.now() - halfMs;
    const recent = bookings.filter((b) => new Date(b.created_at).getTime() > mid).length;
    const prev = bookings.length - recent;
    if (prev === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - prev) / prev) * 100);
  }, [bookings, period]);

  // ============ Chart data ============
  const flowSeries = useMemo(() => {
    const days = periodDays[period] || 30;
    const buckets: Record<string, { date: string; revenue: number; bookings: number; payouts: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, revenue: 0, bookings: 0, payouts: 0 };
    }
    bookings.forEach((b) => {
      const key = new Date(b.created_at).toISOString().slice(0, 10);
      if (buckets[key] && b.status !== 'cancelled') {
        buckets[key].revenue += Number(b.cost_aed || 0);
        buckets[key].bookings += 1;
      }
    });
    payouts.forEach((p) => {
      const key = new Date(p.payment_date).toISOString().slice(0, 10);
      if (buckets[key]) buckets[key].payouts += Number(p.amount_aed || 0);
    });
    return Object.values(buckets).map((d) => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [bookings, payouts, period]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      const k = b.payment_status || 'pending';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const topZones = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach((b) => {
      if (!b.zone || b.status === 'cancelled') return;
      map[b.zone] = (map[b.zone] || 0) + Number(b.cost_aed || 0);
    });
    const arr = Object.entries(map)
      .map(([zone, amount]) => ({ zone, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
    return arr;
  }, [bookings]);

  const STATUS_COLORS: Record<string, string> = {
    paid: 'hsl(160 75% 50%)',
    confirmed: 'hsl(160 75% 50%)',
    pre_authorized: 'hsl(var(--primary-glow))',
    pending: 'hsl(45 90% 55%)',
    cancelled: 'hsl(0 75% 55%)',
    failed: 'hsl(0 75% 55%)',
  };

  return (
    <div className="cosmic-bg rounded-3xl p-4 sm:p-6 lg:p-8 -mx-2 sm:mx-0 animate-fade-in">
      {/* ============ Header ============ */}
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cosmic-ring shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              <span className="neon-text">Revenue</span> Command Center
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 flex items-center gap-2">
              <span className="cosmic-pulse-dot inline-block h-2 w-2 rounded-full bg-primary-glow" />
              Live · synced {Math.round((Date.now() - lastSync.getTime()) / 1000)}s ago
              <button
                onClick={fetchData}
                className="ml-2 inline-flex items-center gap-1 text-primary-glow hover:text-white transition"
                aria-label="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </p>
          </div>
        </div>

        {/* Period selector + currency */}
        <div className="flex items-center gap-2 flex-wrap">
          <CurrencySwitcher variant="dark" />
          <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  period === p
                    ? 'bg-gradient-to-br from-primary to-primary-glow text-white shadow-[0_0_20px_hsl(var(--primary-glow)/0.6)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ KPI Grid ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Gross Revenue"
          value={grossRevenue}
          suffix=" AED"
          delta={delta}
          spark={flowSeries.map((d) => d.revenue)}
        />
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Pre-auth Held"
          value={preAuthHeld}
          suffix=" AED"
          tone="amber"
          spark={flowSeries.map((d) => d.revenue * 0.4)}
        />
        <KpiCard
          icon={<Building2 className="h-4 w-4" />}
          label="Platform Margin"
          value={platformMargin}
          suffix=" AED"
          tone="success"
          gauge={marginPct}
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Owner Payouts"
          value={payoutsTotal}
          suffix=" AED"
          spark={flowSeries.map((d) => d.payouts)}
        />
      </div>

      {/* ============ Money flow + revenue chart ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-5 mb-6">
        {/* Revenue chart */}
        <div className="cosmic-card rounded-3xl p-4 sm:p-6 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-glow" />
                Revenue trajectory
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Bookings income & payouts over time</p>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pay-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(45 90% 60%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(45 90% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <filter id="chart-glow">
                    <feGaussianBlur stdDeviation="2.5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="hsl(0 0% 100% / 0.4)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(0 0% 100% / 0.4)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220 40% 8% / 0.95)',
                    border: '1px solid hsl(var(--primary-glow) / 0.4)',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 12,
                  }}
                  formatter={(v: any) => `${fmtAed(Number(v))} AED`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary-glow))"
                  strokeWidth={2.5}
                  fill="url(#rev-grad)"
                  filter="url(#chart-glow)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="payouts"
                  stroke="hsl(45 90% 60%)"
                  strokeWidth={2}
                  fill="url(#pay-grad)"
                  name="Payouts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Money flow */}
        <div className="cosmic-card rounded-3xl p-4 sm:p-6 xl:col-span-2">
          <div className="mb-2">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary-glow" />
              Money flow
            </h3>
            <p className="text-xs text-white/50 mt-0.5">How AED moves through the platform</p>
          </div>
          <MoneyFlowDiagram
            bookingsTotal={grossRevenue - preAuthHeld}
            preAuthTotal={preAuthHeld}
            payoutsTotal={payoutsTotal}
            platformMargin={platformMargin}
          />
        </div>
      </div>

      {/* ============ Top zones + Live pulse ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 mb-6">
        <div className="cosmic-card rounded-3xl p-4 sm:p-6 lg:col-span-2">
          <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-glow" />
            Top revenue zones
          </h3>
          {topZones.length === 0 ? (
            <p className="text-sm text-white/50 py-12 text-center">No zone data yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topZones} outerRadius={90}>
                  <PolarGrid stroke="hsl(var(--primary-glow) / 0.2)" />
                  <PolarAngleAxis
                    dataKey="zone"
                    tick={{ fill: 'hsl(0 0% 100% / 0.7)', fontSize: 10 }}
                  />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar
                    name="AED"
                    dataKey="amount"
                    stroke="hsl(var(--primary-glow))"
                    fill="hsl(var(--primary-glow))"
                    fillOpacity={0.45}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(220 40% 8% / 0.95)',
                      border: '1px solid hsl(var(--primary-glow) / 0.4)',
                      borderRadius: 12,
                      color: 'white',
                      fontSize: 12,
                    }}
                    formatter={(v: any) => `${fmtAed(Number(v))} AED`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="cosmic-card rounded-3xl p-4 sm:p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-glow" />
              Live pulse
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <span className="cosmic-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              streaming
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {pulse.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-sm">
                Waiting for activity… new bookings & payouts will appear here in real-time.
              </div>
            ) : (
              pulse.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary-glow/40 transition animate-fade-in"
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      ev.kind === 'payout'
                        ? 'bg-amber-400/20 text-amber-300'
                        : ev.kind === 'preauth'
                        ? 'bg-primary-glow/20 text-primary-glow'
                        : 'bg-emerald-400/20 text-emerald-300'
                    }`}
                  >
                    {ev.kind === 'payout' ? (
                      <Wallet className="h-4 w-4" />
                    ) : ev.kind === 'preauth' ? (
                      <CreditCard className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{ev.label}</p>
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(ev.at)}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-white whitespace-nowrap">
                    {fmtAed(ev.amount)} <span className="text-[10px] text-white/50">AED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============ Status breakdown ============ */}
      <div className="cosmic-card rounded-3xl p-4 sm:p-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary-glow" />
          Payment status breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="hsl(220 40% 6%)"
                  strokeWidth={2}
                >
                  {statusBreakdown.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.name] || 'hsl(var(--primary))'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220 40% 8% / 0.95)',
                    border: '1px solid hsl(var(--primary-glow) / 0.4)',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {statusBreakdown.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: STATUS_COLORS[s.name] || 'hsl(var(--primary))',
                      boxShadow: `0 0 12px ${STATUS_COLORS[s.name] || 'hsl(var(--primary))'}`,
                    }}
                  />
                  <span className="text-sm text-white capitalize">
                    {s.name.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">{s.value}</span>
              </div>
            ))}
            {statusBreakdown.length === 0 && (
              <p className="text-sm text-white/40 text-center py-8">No bookings in this period</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ KPI sub-component ============
interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  spark?: number[];
  gauge?: number;
  tone?: 'primary' | 'success' | 'amber';
}

const KpiCard = ({ icon, label, value, suffix, delta, spark, gauge, tone = 'primary' }: KpiCardProps) => {
  const accent =
    tone === 'success'
      ? 'from-emerald-400/30 to-primary/10 text-emerald-300'
      : tone === 'amber'
      ? 'from-amber-400/30 to-primary/5 text-amber-300'
      : 'from-primary/30 to-primary-glow/10 text-primary-glow';

  return (
    <div className="cosmic-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
      <div
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
            {icon}
          </div>
          {typeof delta === 'number' && delta !== 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                delta > 0
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-red-500/15 text-red-300'
              }`}
            >
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 font-bold">
          {label}
        </p>
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 leading-tight tabular-nums">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>

        {/* Sparkline */}
        {spark && spark.length > 1 && (
          <div className="mt-3 h-10">
            <Sparkline data={spark} />
          </div>
        )}

        {/* Gauge */}
        {typeof gauge === 'number' && (
          <div className="mt-3 flex items-center gap-3">
            <div
              className="relative h-12 w-12 rounded-full gauge-track flex items-center justify-center"
              style={{ ['--gauge' as any]: `${gauge}%` }}
            >
              <div className="h-9 w-9 rounded-full bg-[hsl(220_40%_8%)] flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{Math.round(gauge)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-white/50 leading-tight">
              of gross<br />retained
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ Mini sparkline ============
const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--primary-glow))"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#spark-fill)" />
    </svg>
  );
};

const timeAgo = (d: Date) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};

export default RevenueCommandCenter;
