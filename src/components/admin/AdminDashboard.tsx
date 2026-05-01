import { useMemo, useState } from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, LineChart, Line, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Car, CreditCard,
  Megaphone, Send, RefreshCw, AlertCircle, Crown, Activity, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Sparkles, Wallet, Receipt, UserPlus,
  Target, Zap,
} from 'lucide-react';
import { BroadcastDialog } from './BroadcastDialog';
import { MessageUserDialog } from './MessageUserDialog';
import { useCurrency } from '@/contexts/CurrencyContext';

const fmtAedCompact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : n.toFixed(0);

const relTime = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const statusColor = (s?: string) => {
  switch (s) {
    case 'confirmed':
    case 'completed':
    case 'paid':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'pre_authorized':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
    case 'pending':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

interface Props {
  onJumpTab?: (tab: string) => void;
}

export function AdminDashboard({ onJumpTab }: Props) {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const { data, loading, refreshing, lastUpdated, refetch } = useAdminStats(range);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const { format: fmtMoney, convert, symbol, currency } = useCurrency();
  // Compact format in active currency
  const fmtMoneyCompact = (aedAmount: number) => {
    const v = convert(aedAmount);
    if (Math.abs(v) >= 1000) {
      return `${symbol}${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}`;
    }
    return `${symbol}${Math.round(v)}`;
  };

  const { kpis, trend, zones, topOwners, recent } = data;

  const gmvDelta = useMemo(() => {
    if (!kpis.gmvPrev30d) return kpis.gmvLast30d > 0 ? 100 : 0;
    return ((kpis.gmvLast30d - kpis.gmvPrev30d) / kpis.gmvPrev30d) * 100;
  }, [kpis.gmvLast30d, kpis.gmvPrev30d]);

  const trendData = useMemo(
    () => trend.map((t) => ({
      ...t,
      label: new Date(t.day + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    })),
    [trend]
  );

  return (
    <div className="space-y-6">
      {/* Header / range / refresh */}
      <div
        className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-primary/20 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--background)) 60%, hsl(var(--primary) / 0.06) 100%)',
          boxShadow:
            '0 14px 40px -16px hsl(var(--primary) / 0.35), inset 0 1px 0 0 hsl(0 0% 100% / 0.7)',
        }}
      >
        <div
          className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary-glow)), transparent 70%)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.55)]">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gradient-primary">Boss Dashboard</h2>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live · {lastUpdated ? `updated ${relTime(lastUpdated.toISOString())}` : 'syncing…'}
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-primary/20 bg-background/80 backdrop-blur p-1 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.6)]">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={range === d ? 'default' : 'ghost'}
                className={`h-7 px-3 text-xs ${range === d ? 'shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]' : ''}`}
                onClick={() => setRange(d as 7 | 30 | 90)}
              >
                {d}d
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refetch}
            disabled={refreshing}
            className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI ROW 1 — money */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="GMV (paid)"
          value={`${fmtMoney(kpis.gmvAed)}`}
          accent="primary"
          footer={
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${gmvDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {gmvDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(gmvDelta).toFixed(0)}% · last 30d
            </span>
          }
          loading={loading}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Net revenue"
          value={`${fmtMoney(kpis.netRevenueAed)}`}
          accent="emerald"
          footer={<span className="text-xs text-muted-foreground">GMV − payouts</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Owner payouts"
          value={`${fmtMoney(kpis.ownerPayoutsTotal)}`}
          accent="amber"
          footer={<span className="text-xs text-muted-foreground font-medium">{fmtMoneyCompact(kpis.ownerPayoutsLast30d)} in 30d</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Car className="h-4 w-4" />}
          label="Bookings"
          value={kpis.totalBookings.toString()}
          accent="sky"
          footer={
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="outline" className={statusColor('paid')}>{kpis.paidBookings} paid</Badge>
              <Badge variant="outline" className={statusColor('pre_authorized')}>{kpis.preAuthorizedBookings} pre-auth</Badge>
              <Badge variant="outline" className={statusColor('cancelled')}>{kpis.cancelledBookings} cancel</Badge>
            </div>
          }
          loading={loading}
        />
      </div>

      {/* KPI ROW 2 — users */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Total users"
          value={kpis.totalUsers.toString()}
          accent="primary"
          footer={<span className="text-xs text-emerald-600 font-semibold">+{kpis.newUsers30d} in 30d · +{kpis.newUsers7d} in 7d</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Crown className="h-4 w-4" />}
          label="Paying owners"
          value={kpis.payingOwners.toString()}
          accent="amber"
          footer={<span className="text-xs text-muted-foreground">received ≥1 payout</span>}
          loading={loading}
        />
        <KpiCard
          icon={<UserPlus className="h-4 w-4" />}
          label="Free users"
          value={kpis.freeUsers.toString()}
          accent="sky"
          footer={<span className="text-xs text-muted-foreground">no listing · no payout</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label="Conversion"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          accent="emerald"
          footer={<span className="text-xs text-muted-foreground">users with paid booking</span>}
          loading={loading}
        />
      </div>

      {/* Alerts row */}
      {(kpis.unreadAdminMessages > 0 || kpis.pendingVerifications > 0 || kpis.pendingListings > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kpis.unreadAdminMessages > 0 && (
            <AlertChip
              icon={<AlertCircle className="h-4 w-4" />}
              label={`${kpis.unreadAdminMessages} unread message${kpis.unreadAdminMessages === 1 ? '' : 's'}`}
              onClick={() => onJumpTab?.('chat')}
              tone="amber"
            />
          )}
          {kpis.pendingVerifications > 0 && (
            <AlertChip
              icon={<ShieldAlert className="h-4 w-4" />}
              label={`${kpis.pendingVerifications} pending KYC`}
              onClick={() => onJumpTab?.('users')}
              tone="rose"
            />
          )}
          {kpis.pendingListings > 0 && (
            <AlertChip
              icon={<Car className="h-4 w-4" />}
              label={`${kpis.pendingListings} listings to review`}
              onClick={() => onJumpTab?.('parking')}
              tone="sky"
            />
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          className="lg:col-span-2 relative overflow-hidden border border-primary/15 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(var(--primary)/0.5)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(var(--primary) / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Revenue & bookings
              <Badge variant="outline" className="ml-auto text-[10px] font-semibold border-primary/30 text-primary bg-primary/5">last {range}d</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => fmtMoneyCompact(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(value: any, name: string) => name === 'revenue' ? [`${fmtMoney(Number(value))}`, 'Revenue'] : [value, 'Bookings']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
                <Bar yAxisId="right" dataKey="bookings" fill="hsl(var(--primary-glow))" opacity={0.6} radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border border-emerald-500/20 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(152_70%_45%/0.4)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(152 70% 45% / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(152_70%_45%/0.5)]">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              New users
              <Badge variant="outline" className="ml-auto text-[10px] font-semibold border-emerald-500/30 text-emerald-700 bg-emerald-500/5">last {range}d</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="usr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152 70% 45%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(152 70% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Line type="monotone" dataKey="newUsers" stroke="hsl(152 70% 45%)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(152 70% 45%)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Zones + Top owners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          className="relative overflow-hidden border border-sky-500/20 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(200_90%_50%/0.4)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(200 90% 50% / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(200_90%_50%/0.5)]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              Top zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(zones.length * 36, 220)}>
              <BarChart data={zones.slice(0, 8)} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => fmtMoneyCompact(v)} />
                <YAxis type="category" dataKey="zone" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(value: any, name: string) =>
                    name === 'revenue' ? [`${fmtMoney(Number(value))}`, 'Revenue'] : [value, name === 'listings' ? 'Listings' : 'Bookings']
                  }
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="listings" fill="hsl(var(--primary-glow))" opacity={0.6} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border border-amber-500/20 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(40_95%_55%/0.4)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(40 95% 55% / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(40_95%_55%/0.5)]">
                <Crown className="h-4 w-4 text-white" />
              </div>
              Top earning owners
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => onJumpTab?.('owner-payments')}>View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {topOwners.length === 0 && <div className="p-6 text-sm text-muted-foreground">No payouts yet.</div>}
              {topOwners.map((o, i) => {
                const medal =
                  i === 0 ? { bg: 'bg-gradient-to-br from-amber-400 to-amber-500', shadow: '0 4px 12px -4px hsl(40 95% 55% / 0.6)' } :
                  i === 1 ? { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', shadow: '0 4px 12px -4px hsl(215 15% 60% / 0.6)' } :
                  i === 2 ? { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', shadow: '0 4px 12px -4px hsl(25 90% 55% / 0.6)' } :
                  { bg: 'bg-gradient-to-br from-muted to-muted/70', shadow: 'none' };
                return (
                  <div key={o.ownerId} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-all duration-200 hover:translate-x-0.5">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${medal.bg}`}
                      style={{ boxShadow: medal.shadow }}
                    >
                      {i < 3 ? '★' : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{o.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{o.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary tabular-nums">{fmtMoney(o.totalEarned)}</div>
                      <div className="text-[10px] text-muted-foreground">{o.listingsCount} listing{o.listingsCount === 1 ? '' : 's'} · {o.payoutsCount} payout{o.payoutsCount === 1 ? '' : 's'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          className="lg:col-span-2 relative overflow-hidden border border-emerald-500/20 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(152_70%_45%/0.4)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(152 70% 45% / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(152_70%_45%/0.5)] relative">
                <Activity className="h-4 w-4 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200 border border-white"></span>
                </span>
              </div>
              Live activity
              <Badge variant="outline" className="ml-auto text-[10px] font-semibold border-emerald-500/30 text-emerald-700 bg-emerald-500/5 animate-pulse">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
              {recent.length === 0 && <div className="p-6 text-sm text-muted-foreground">Nothing yet — once data flows it will appear here in real time.</div>}
              {recent.map((r) => {
                const kindStyle =
                  r.kind === 'booking' ? { bg: 'bg-gradient-to-br from-primary to-primary-glow', glow: 'hsl(var(--primary) / 0.5)' } :
                  r.kind === 'user' ? { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-400', glow: 'hsl(152 70% 45% / 0.5)' } :
                  r.kind === 'payment' ? { bg: 'bg-gradient-to-br from-amber-500 to-amber-400', glow: 'hsl(40 95% 55% / 0.5)' } :
                  { bg: 'bg-gradient-to-br from-sky-500 to-sky-400', glow: 'hsl(200 90% 50% / 0.5)' };
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-all duration-200 hover:translate-x-0.5">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-white ${kindStyle.bg}`}
                      style={{ boxShadow: `0 4px 12px -4px ${kindStyle.glow}, inset 0 1px 0 0 hsl(0 0% 100% / 0.4)` }}
                    >
                      {r.kind === 'booking' && <Car className="h-4 w-4" />}
                      {r.kind === 'user' && <Users className="h-4 w-4" />}
                      {r.kind === 'payment' && <DollarSign className="h-4 w-4" />}
                      {r.kind === 'listing' && <Receipt className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                    </div>
                    <div className="text-right">
                      {r.amountAed !== undefined && r.amountAed > 0 && (
                        <div className="text-sm font-bold text-primary tabular-nums">{fmtMoney(r.amountAed)}</div>
                      )}
                      {r.status && (
                        <Badge variant="outline" className={`${statusColor(r.status)} text-[10px] py-0 px-1.5 mt-0.5`}>
                          {r.status}
                        </Badge>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-0.5">{relTime(r.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border border-primary/20 transition-all duration-300 hover:shadow-[0_18px_48px_-18px_hsl(var(--primary)/0.5)]"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
            boxShadow: '0 6px 22px -10px hsl(var(--primary) / 0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.5)] hover:shadow-[0_10px_24px_-6px_hsl(var(--primary-glow)/0.6)] hover:-translate-y-0.5 transition-all"
              onClick={() => setBroadcastOpen(true)}
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Broadcast to all users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-primary/30 hover:border-primary/60 hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
              onClick={() => setMessageOpen(true)}
            >
              <Send className="h-4 w-4 mr-2 text-primary" />
              Message a user
            </Button>
            <div className="pt-2 border-t border-border/50 mt-2 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Jump to</p>
              {[
                { tab: 'pre-auth', icon: CreditCard, label: 'Pre-authorizations', count: kpis.preAuthorizedBookings, tone: 'sky' },
                { tab: 'owner-payments', icon: Wallet, label: 'Owner payments', count: null, tone: 'amber' },
                { tab: 'users', icon: Users, label: 'Users & KYC', count: kpis.pendingVerifications, tone: 'emerald' },
                { tab: 'chat', icon: AlertCircle, label: 'Chat support', count: kpis.unreadAdminMessages, tone: 'rose' },
              ].map(({ tab, icon: Ico, label, count, tone }) => {
                const toneClasses: Record<string, string> = {
                  sky: 'text-sky-600 bg-sky-50',
                  amber: 'text-amber-600 bg-amber-50',
                  emerald: 'text-emerald-600 bg-emerald-50',
                  rose: 'text-rose-600 bg-rose-50',
                };
                return (
                  <Button
                    key={tab}
                    variant="ghost"
                    className="w-full justify-start text-sm hover:bg-primary/5 hover:translate-x-0.5 transition-all"
                    onClick={() => onJumpTab?.(tab)}
                  >
                    <span className={`h-6 w-6 rounded-md flex items-center justify-center mr-2 ${toneClasses[tone]}`}>
                      <Ico className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-left">{label}</span>
                    {count !== null && count > 0 && (
                      <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20 text-[10px]">{count}</Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} totalUsers={kpis.totalUsers} />
      <MessageUserDialog open={messageOpen} onOpenChange={setMessageOpen} />
    </div>
  );
}

type Accent = 'primary' | 'emerald' | 'amber' | 'sky' | 'rose';

const accentStyles: Record<Accent, { bg: string; ring: string; iconBg: string; iconText: string; glow: string }> = {
  primary: {
    bg: 'bg-gradient-to-br from-primary/8 via-transparent to-primary/12',
    ring: 'ring-primary/25',
    iconBg: 'bg-gradient-to-br from-primary to-primary-glow',
    iconText: 'text-white',
    glow: 'hsl(var(--primary) / 0.45)',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500/8 via-transparent to-emerald-500/12',
    ring: 'ring-emerald-500/25',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-400',
    iconText: 'text-white',
    glow: 'hsl(152 70% 45% / 0.45)',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/8 via-transparent to-amber-500/12',
    ring: 'ring-amber-500/25',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-400',
    iconText: 'text-white',
    glow: 'hsl(40 95% 55% / 0.45)',
  },
  sky: {
    bg: 'bg-gradient-to-br from-sky-500/8 via-transparent to-sky-500/12',
    ring: 'ring-sky-500/25',
    iconBg: 'bg-gradient-to-br from-sky-500 to-sky-400',
    iconText: 'text-white',
    glow: 'hsl(200 90% 50% / 0.45)',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500/8 via-transparent to-rose-500/12',
    ring: 'ring-rose-500/25',
    iconBg: 'bg-gradient-to-br from-rose-500 to-rose-400',
    iconText: 'text-white',
    glow: 'hsl(350 80% 55% / 0.45)',
  },
};

function KpiCard({
  icon, label, value, footer, accent = 'primary', loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footer?: React.ReactNode;
  accent?: Accent;
  loading?: boolean;
}) {
  const a = accentStyles[accent];
  return (
    <Card
      className={`group relative overflow-hidden ring-1 ${a.ring} border-border/60 transition-all duration-300 hover:-translate-y-1 hover:ring-2`}
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--surface)) 100%)',
        boxShadow: `0 4px 14px -6px ${a.glow}, inset 0 1px 0 0 hsl(0 0% 100% / 0.85)`,
      }}
    >
      <div className={`absolute inset-0 ${a.bg} pointer-events-none`} />
      <div
        className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${a.glow}, transparent 70%)` }}
      />
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center ${a.iconBg} ${a.iconText} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
            style={{ boxShadow: `0 6px 16px -6px ${a.glow}, inset 0 1px 0 0 hsl(0 0% 100% / 0.4)` }}
          >
            {icon}
          </div>
        </div>
        <div className="text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums">
          {loading ? <span className="inline-block h-7 w-24 rounded bg-muted animate-pulse" /> : value}
        </div>
        {footer && <div className="mt-2">{footer}</div>}
      </CardContent>
    </Card>
  );
}

function AlertChip({
  icon, label, onClick, tone,
}: {
  icon: React.ReactNode; label: string; onClick?: () => void;
  tone: 'amber' | 'rose' | 'sky';
}) {
  const colors = {
    amber: { bg: 'from-amber-50 to-amber-100/70', border: 'border-amber-300/60', text: 'text-amber-800', glow: 'hsl(40 95% 55% / 0.35)', dot: 'bg-amber-500' },
    rose:  { bg: 'from-rose-50 to-rose-100/70',   border: 'border-rose-300/60',  text: 'text-rose-800',  glow: 'hsl(350 80% 55% / 0.35)', dot: 'bg-rose-500' },
    sky:   { bg: 'from-sky-50 to-sky-100/70',     border: 'border-sky-300/60',   text: 'text-sky-800',   glow: 'hsl(200 90% 50% / 0.35)', dot: 'bg-sky-500' },
  };
  const c = colors[tone];
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${c.border} ${c.text} bg-gradient-to-br ${c.bg} transition-all duration-300 text-sm font-semibold hover:-translate-y-0.5 overflow-hidden`}
      style={{ boxShadow: `0 4px 14px -6px ${c.glow}, inset 0 1px 0 0 hsl(0 0% 100% / 0.8)` }}
    >
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`}></span>
        </span>
        {icon}
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
