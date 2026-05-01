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
  ArrowUpRight, ArrowDownRight,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">Boss Dashboard</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
            Live · {lastUpdated ? `updated ${relTime(lastUpdated.toISOString())}` : 'syncing…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-background p-1">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={range === d ? 'default' : 'ghost'}
                className="h-7 px-3 text-xs"
                onClick={() => setRange(d as 7 | 30 | 90)}
              >
                {d}d
              </Button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={refetch} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI ROW 1 — money */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="GMV (paid)"
          value={`${fmtMoney(kpis.gmvAed)} د.إ`}
          accent="primary"
          footer={
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${gmvDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {gmvDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(gmvDelta).toFixed(0)}% · last 30d
            </span>
          }
          loading={loading}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Net revenue"
          value={`${fmtMoney(kpis.netRevenueAed)} د.إ`}
          accent="primary"
          footer={<span className="text-xs text-muted-foreground">GMV − payouts</span>}
          loading={loading}
        />
        <KpiCard
          icon={<CreditCard className="h-4 w-4" />}
          label="Owner payouts"
          value={`${fmtMoney(kpis.ownerPayoutsTotal)} د.إ`}
          footer={<span className="text-xs text-muted-foreground">{fmtMoneyCompact(kpis.ownerPayoutsLast30d)} د.إ in 30d</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Car className="h-4 w-4" />}
          label="Bookings"
          value={kpis.totalBookings.toString()}
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
          footer={<span className="text-xs text-emerald-600 font-medium">+{kpis.newUsers30d} in 30d · +{kpis.newUsers7d} in 7d</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Crown className="h-4 w-4" />}
          label="Paying owners"
          value={kpis.payingOwners.toString()}
          footer={<span className="text-xs text-muted-foreground">received ≥1 payout</span>}
          loading={loading}
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Free users"
          value={kpis.freeUsers.toString()}
          footer={<span className="text-xs text-muted-foreground">no listing · no payout</span>}
          loading={loading}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Conversion"
          value={`${kpis.conversionRate.toFixed(1)}%`}
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
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue & bookings · last {range}d</CardTitle>
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
                  formatter={(value: any, name: string) => name === 'revenue' ? [`${fmtMoney(Number(value))} AED`, 'Revenue'] : [value, 'Bookings']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
                <Bar yAxisId="right" dataKey="bookings" fill="hsl(var(--primary-glow))" opacity={0.6} radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New users · last {range}d</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Line type="monotone" dataKey="newUsers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Zones + Top owners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top zones</CardTitle>
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
                    name === 'revenue' ? [`${fmtMoney(Number(value))} AED`, 'Revenue'] : [value, name === 'listings' ? 'Listings' : 'Bookings']
                  }
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="listings" fill="hsl(var(--primary-glow))" opacity={0.6} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Crown className="h-4 w-4 text-primary" /> Top earning owners</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => onJumpTab?.('owner-payments')}>View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topOwners.length === 0 && <div className="p-6 text-sm text-muted-foreground">No payouts yet.</div>}
              {topOwners.map((o, i) => (
                <div key={o.ownerId} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-700' :
                    i === 1 ? 'bg-slate-400/20 text-slate-700' :
                    i === 2 ? 'bg-orange-600/20 text-orange-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{o.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{fmtMoney(o.totalEarned)} د.إ</div>
                    <div className="text-xs text-muted-foreground">{o.listingsCount} listing{o.listingsCount === 1 ? '' : 's'} · {o.payoutsCount} payout{o.payoutsCount === 1 ? '' : 's'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Live activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[420px] overflow-y-auto">
              {recent.length === 0 && <div className="p-6 text-sm text-muted-foreground">Nothing yet — once data flows it will appear here in real time.</div>}
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    r.kind === 'booking' ? 'bg-primary/15 text-primary' :
                    r.kind === 'user' ? 'bg-emerald-500/15 text-emerald-600' :
                    r.kind === 'payment' ? 'bg-amber-500/15 text-amber-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {r.kind === 'booking' && <Car className="h-4 w-4" />}
                    {r.kind === 'user' && <Users className="h-4 w-4" />}
                    {r.kind === 'payment' && <DollarSign className="h-4 w-4" />}
                    {r.kind === 'listing' && <Car className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                  </div>
                  <div className="text-right">
                    {r.amountAed !== undefined && r.amountAed > 0 && (
                      <div className="text-sm font-semibold">{fmtMoney(r.amountAed)} د.إ</div>
                    )}
                    {r.status && (
                      <Badge variant="outline" className={`${statusColor(r.status)} text-[10px] py-0 px-1.5 mt-0.5`}>
                        {r.status}
                      </Badge>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-0.5">{relTime(r.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" onClick={() => setBroadcastOpen(true)}>
              <Megaphone className="h-4 w-4 mr-2" />
              Broadcast to all users
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setMessageOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Message a user
            </Button>
            <div className="pt-2 border-t mt-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jump to</p>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onJumpTab?.('pre-auth')}>
                💳 Pre-authorizations ({kpis.preAuthorizedBookings})
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onJumpTab?.('owner-payments')}>
                💰 Owner payments
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onJumpTab?.('users')}>
                👥 Users & KYC ({kpis.pendingVerifications})
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => onJumpTab?.('chat')}>
                💬 Chat support ({kpis.unreadAdminMessages})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} totalUsers={kpis.totalUsers} />
      <MessageUserDialog open={messageOpen} onOpenChange={setMessageOpen} />
    </div>
  );
}

function KpiCard({
  icon, label, value, footer, accent, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footer?: React.ReactNode;
  accent?: 'primary';
  loading?: boolean;
}) {
  return (
    <Card className={`glass-card relative overflow-hidden ${accent === 'primary' ? 'ring-1 ring-primary/20' : ''}`}>
      {accent === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      )}
      <CardContent className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
            accent === 'primary' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          }`}>{icon}</div>
        </div>
        <div className="text-2xl font-bold tracking-tight">
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
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20',
    sky: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition text-sm font-medium ${colors[tone]}`}
    >
      <span className="flex items-center gap-2">{icon}{label}</span>
      <ArrowUpRight className="h-4 w-4 opacity-60" />
    </button>
  );
}
