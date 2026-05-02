import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminKPIs {
  totalUsers: number;
  newUsers30d: number;
  newUsers7d: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalBookings: number;
  paidBookings: number;
  preAuthorizedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  gmvAed: number;
  gmvLast30d: number;
  gmvPrev30d: number;
  ownerPayoutsTotal: number;
  ownerPayoutsLast30d: number;
  netRevenueAed: number;
  payingOwners: number;
  freeUsers: number;
  conversionRate: number;
  unreadAdminMessages: number;
  pendingVerifications: number;
}

export interface TrendPoint {
  day: string;
  bookings: number;
  revenue: number;
  newUsers: number;
}

export interface ZoneBreakdown {
  zone: string;
  listings: number;
  bookings: number;
  revenue: number;
}

export interface TopOwner {
  ownerId: string;
  name: string;
  email: string;
  listingsCount: number;
  totalEarned: number;
  payoutsCount: number;
}

export interface RecentActivity {
  id: string;
  kind: 'booking' | 'listing' | 'user' | 'payment';
  title: string;
  subtitle: string;
  amountAed?: number;
  status?: string;
  createdAt: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  pct: number; // % of total bookings
}

export interface ZoneSlice {
  zone: string;
  bookings: number;
}

export interface RecentBooking {
  id: string;
  zone: string;
  location: string;
  status: string;
  paymentStatus: string;
  amountAed: number;
  createdAt: string;
  userName: string;
}

export interface TodayKPIs {
  bookingsToday: number;
  revenueToday: number;
  pendingActions: number; // KYC + listings + unread
}

export interface AdminDashboardData {
  kpis: AdminKPIs;
  today: TodayKPIs;
  trend: TrendPoint[];
  zones: ZoneBreakdown[];
  topOwners: TopOwner[];
  recent: RecentActivity[];
  funnel: FunnelStage[];
  zoneDonut: ZoneSlice[];
  hourlyHeatmap: number[][]; // [day 0..6][hour 0..23]
  recentBookings: RecentBooking[];
}

const empty: AdminDashboardData = {
  kpis: {
    totalUsers: 0, newUsers30d: 0, newUsers7d: 0,
    totalListings: 0, activeListings: 0, pendingListings: 0,
    totalBookings: 0, paidBookings: 0, preAuthorizedBookings: 0,
    pendingBookings: 0, cancelledBookings: 0,
    gmvAed: 0, gmvLast30d: 0, gmvPrev30d: 0,
    ownerPayoutsTotal: 0, ownerPayoutsLast30d: 0,
    netRevenueAed: 0,
    payingOwners: 0, freeUsers: 0, conversionRate: 0,
    unreadAdminMessages: 0, pendingVerifications: 0,
  },
  today: { bookingsToday: 0, revenueToday: 0, pendingActions: 0 },
  trend: [],
  zones: [],
  topOwners: [],
  recent: [],
  funnel: [],
  zoneDonut: [],
  hourlyHeatmap: Array.from({ length: 7 }, () => Array(24).fill(0)),
  recentBookings: [],
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export function useAdminStats(rangeDays: 7 | 30 | 90 = 30) {
  const [data, setData] = useState<AdminDashboardData>(empty);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
      const since60 = new Date(Date.now() - 60 * 86400000).toISOString();
      const since7 = new Date(Date.now() - 7 * 86400000).toISOString();
      const sinceRange = new Date(Date.now() - rangeDays * 86400000).toISOString();
      const sincePrevRange = new Date(Date.now() - 2 * rangeDays * 86400000).toISOString();

      const [
        profilesRes, listingsRes, bookingsRes, payoutsRes,
        verificationsRes, messagesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('user_id, created_at, email, full_name, user_type'),
        supabase.from('parking_listings').select('id, owner_id, zone, status, created_at, price_per_month'),
        supabase.from('parking_bookings').select('id, user_id, listing_id, zone, location, status, payment_status, cost_aed, duration_hours, created_at'),
        supabase.from('owner_payments').select('id, owner_id, amount_aed, status, payment_date, listing_id, booking_id'),
        supabase.from('user_verifications').select('id, verification_status'),
        supabase.from('user_messages').select('id, read_status, from_admin').eq('read_status', false).eq('from_admin', false),
      ]);

      const profiles = profilesRes.data || [];
      const listings = listingsRes.data || [];
      const bookings = bookingsRes.data || [];
      const payouts = payoutsRes.data || [];
      const verifications = verificationsRes.data || [];
      const unreadMessages = messagesRes.data || [];

      const isPaidBooking = (b: any) =>
        b.payment_status === 'paid' || b.payment_status === 'confirmed' || b.status === 'confirmed';
      const isActiveListing = (l: any) => l.status === 'approved' || l.status === 'published';

      // Range-scoped subsets (drives all KPIs the user expects to filter)
      const bookingsInRange = bookings.filter((b: any) => b.created_at >= sinceRange);
      const bookingsPrevRange = bookings.filter(
        (b: any) => b.created_at >= sincePrevRange && b.created_at < sinceRange
      );
      const payoutsInRange = payouts.filter((p: any) => p.payment_date >= sinceRange);

      const paidBookings = bookingsInRange.filter(isPaidBooking);
      const paidBookingsAll = bookings.filter(isPaidBooking); // for all-time conversion rate
      const preAuthorized = bookingsInRange.filter((b: any) => b.payment_status === 'pre_authorized');
      const pending = bookingsInRange.filter((b: any) => b.status === 'pending');
      const cancelled = bookingsInRange.filter((b: any) => b.status === 'cancelled');

      // GMV inside the selected range + previous equivalent window for delta
      const gmv = paidBookings.reduce((s, b: any) => s + Number(b.cost_aed || 0), 0);
      const gmvPrev = bookingsPrevRange
        .filter(isPaidBooking)
        .reduce((s, b: any) => s + Number(b.cost_aed || 0), 0);

      // Backward-compat 30d numbers (still used by some footers)
      const gmv30 = bookings
        .filter((b: any) => b.created_at >= since30)
        .filter(isPaidBooking)
        .reduce((s, b: any) => s + Number(b.cost_aed || 0), 0);
      const gmvPrev30 = bookings
        .filter((b: any) => b.created_at >= since60 && b.created_at < since30)
        .filter(isPaidBooking)
        .reduce((s, b: any) => s + Number(b.cost_aed || 0), 0);

      const completedPayoutsRange = payoutsInRange.filter((p: any) => p.status === 'completed');
      const payoutsTotal = completedPayoutsRange.reduce((s, p: any) => s + Number(p.amount_aed || 0), 0);
      const payouts30 = payouts
        .filter((p: any) => p.status === 'completed' && p.payment_date >= since30)
        .reduce((s, p: any) => s + Number(p.amount_aed || 0), 0);

      // All-time payouts kept as a reference for top owners + free-user calc
      const completedPayoutsAll = payouts.filter((p: any) => p.status === 'completed');
      const payingOwnerIds = new Set(completedPayoutsAll.map((p: any) => p.owner_id));
      const ownersWithListings = new Set(listings.map((l: any) => l.owner_id).filter(Boolean));
      const freeUsers = profiles.filter(
        (p: any) => !payingOwnerIds.has(p.user_id) && !ownersWithListings.has(p.user_id)
      ).length;

      const usersWithPaidBooking = new Set(paidBookingsAll.map((b: any) => b.user_id));
      const conversionRate = profiles.length
        ? (usersWithPaidBooking.size / profiles.length) * 100
        : 0;

      const newUsersInRange = profiles.filter((p: any) => p.created_at >= sinceRange).length;

      const kpis: AdminKPIs = {
        totalUsers: profiles.length,
        newUsers30d: newUsersInRange, // now range-scoped (label updated in UI)
        newUsers7d: profiles.filter((p: any) => p.created_at >= since7).length,
        totalListings: listings.length,
        activeListings: listings.filter(isActiveListing).length,
        pendingListings: listings.filter((l: any) => l.status === 'pending').length,
        totalBookings: bookingsInRange.length,
        paidBookings: paidBookings.length,
        preAuthorizedBookings: preAuthorized.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        gmvAed: gmv,
        gmvLast30d: gmv,        // alias to active range for the KPI footer delta
        gmvPrev30d: gmvPrev,    // previous equivalent window
        ownerPayoutsTotal: payoutsTotal,
        ownerPayoutsLast30d: payouts30,
        netRevenueAed: gmv - payoutsTotal,
        payingOwners: payingOwnerIds.size,
        freeUsers,
        conversionRate,
        unreadAdminMessages: unreadMessages.length,
        pendingVerifications: verifications.filter((v: any) => v.verification_status === 'pending').length,
      };

      // Trend
      const dayBuckets = new Map<string, TrendPoint>();
      for (let i = rangeDays - 1; i >= 0; i--) {
        const d = ymd(new Date(Date.now() - i * 86400000));
        dayBuckets.set(d, { day: d, bookings: 0, revenue: 0, newUsers: 0 });
      }
      bookings
        .filter((b: any) => b.created_at >= sinceRange)
        .forEach((b: any) => {
          const d = String(b.created_at).slice(0, 10);
          const bucket = dayBuckets.get(d);
          if (bucket) {
            bucket.bookings += 1;
            if (isPaidBooking(b)) bucket.revenue += Number(b.cost_aed || 0);
          }
        });
      profiles
        .filter((p: any) => p.created_at >= sinceRange)
        .forEach((p: any) => {
          const d = String(p.created_at).slice(0, 10);
          const bucket = dayBuckets.get(d);
          if (bucket) bucket.newUsers += 1;
        });
      const trend = Array.from(dayBuckets.values());

      // Zones
      const zoneMap = new Map<string, ZoneBreakdown>();
      const norm = (z: string) => (z || 'Unknown').trim();
      listings.forEach((l: any) => {
        const z = norm(l.zone);
        const existing = zoneMap.get(z) || { zone: z, listings: 0, bookings: 0, revenue: 0 };
        existing.listings += 1;
        zoneMap.set(z, existing);
      });
      bookings.forEach((b: any) => {
        const z = norm(b.zone);
        const existing = zoneMap.get(z) || { zone: z, listings: 0, bookings: 0, revenue: 0 };
        existing.bookings += 1;
        if (isPaidBooking(b)) existing.revenue += Number(b.cost_aed || 0);
        zoneMap.set(z, existing);
      });
      const zones = Array.from(zoneMap.values())
        .sort((a, b) => b.revenue - a.revenue || b.listings - a.listings);

      // Top owners
      const ownerMap = new Map<string, TopOwner>();
      const profileById = new Map<string, any>(profiles.map((p: any) => [p.user_id, p]));
      listings.forEach((l: any) => {
        if (!l.owner_id) return;
        const p = profileById.get(l.owner_id);
        const existing = ownerMap.get(l.owner_id) || {
          ownerId: l.owner_id,
          name: p?.full_name || p?.email?.split('@')[0] || 'Unknown',
          email: p?.email || '',
          listingsCount: 0, totalEarned: 0, payoutsCount: 0,
        };
        existing.listingsCount += 1;
        ownerMap.set(l.owner_id, existing);
      });
      completedPayouts.forEach((p: any) => {
        const prof = profileById.get(p.owner_id);
        const existing = ownerMap.get(p.owner_id) || {
          ownerId: p.owner_id,
          name: prof?.full_name || prof?.email?.split('@')[0] || 'Unknown',
          email: prof?.email || '',
          listingsCount: 0, totalEarned: 0, payoutsCount: 0,
        };
        existing.totalEarned += Number(p.amount_aed || 0);
        existing.payoutsCount += 1;
        ownerMap.set(p.owner_id, existing);
      });
      const topOwners = Array.from(ownerMap.values())
        .sort((a, b) => b.totalEarned - a.totalEarned || b.listingsCount - a.listingsCount)
        .slice(0, 8);

      // Recent activity
      const recent: RecentActivity[] = [];
      bookings
        .slice()
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 6)
        .forEach((b: any) => {
          recent.push({
            id: `b-${b.id}`, kind: 'booking',
            title: `Booking · ${b.location || b.zone}`,
            subtitle: `${b.zone}${b.duration_hours ? ' · ' + Math.round(b.duration_hours / 720) + ' mo' : ''}`,
            amountAed: Number(b.cost_aed || 0),
            status: b.status,
            createdAt: b.created_at,
          });
        });
      profiles
        .slice()
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 4)
        .forEach((p: any) => {
          recent.push({
            id: `u-${p.user_id}`, kind: 'user',
            title: `New user · ${p.full_name || p.email || 'Unknown'}`,
            subtitle: p.email || '',
            createdAt: p.created_at,
          });
        });
      completedPayouts
        .slice()
        .sort((a: any, b: any) => String(b.payment_date).localeCompare(String(a.payment_date)))
        .slice(0, 4)
        .forEach((p: any) => {
          const prof = profileById.get(p.owner_id);
          recent.push({
            id: `p-${p.id}`, kind: 'payment',
            title: `Payout · ${prof?.full_name || prof?.email || 'Owner'}`,
            subtitle: 'Owner payout',
            amountAed: Number(p.amount_aed || 0),
            status: p.status,
            createdAt: p.payment_date,
          });
        });
      recent.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

      // Today KPIs
      const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayIso = startOfToday.toISOString();
      const todaysBookings = bookings.filter((b: any) => b.created_at >= startOfTodayIso);
      const todayPaid = todaysBookings.filter(isPaidBooking);
      const today: TodayKPIs = {
        bookingsToday: todaysBookings.length,
        revenueToday: todayPaid.reduce((s, b: any) => s + Number(b.cost_aed || 0), 0),
        pendingActions:
          (kpis.pendingVerifications || 0) +
          (kpis.pendingListings || 0) +
          (kpis.unreadAdminMessages || 0),
      };

      // Funnel
      const totalB = bookings.length || 1;
      const completedCount = bookings.filter((b: any) => b.status === 'completed').length;
      const funnel: FunnelStage[] = [
        { stage: 'Pending', count: pending.length, pct: (pending.length / totalB) * 100 },
        { stage: 'Pre-authorized', count: preAuthorized.length, pct: (preAuthorized.length / totalB) * 100 },
        { stage: 'Paid', count: paidBookings.length, pct: (paidBookings.length / totalB) * 100 },
        { stage: 'Completed', count: completedCount, pct: (completedCount / totalB) * 100 },
        { stage: 'Cancelled', count: cancelled.length, pct: (cancelled.length / totalB) * 100 },
      ];

      // Zone donut (range-scoped, by booking count)
      const rangeBookings = bookings.filter((b: any) => b.created_at >= sinceRange);
      const donutMap = new Map<string, number>();
      rangeBookings.forEach((b: any) => {
        const z = norm(b.zone);
        donutMap.set(z, (donutMap.get(z) || 0) + 1);
      });
      const zoneDonut: ZoneSlice[] = Array.from(donutMap.entries())
        .map(([zone, count]) => ({ zone, bookings: count }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6);

      // Hourly heatmap (range-scoped) - day index 0=Sun..6=Sat
      const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
      rangeBookings.forEach((b: any) => {
        const d = new Date(b.created_at);
        heatmap[d.getDay()][d.getHours()] += 1;
      });

      // Recent bookings (last 8)
      const recentBookings: RecentBooking[] = bookings
        .slice()
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 8)
        .map((b: any) => {
          const u = profileById.get(b.user_id);
          return {
            id: b.id,
            zone: b.zone || 'Unknown',
            location: b.location || b.zone || '',
            status: b.status,
            paymentStatus: b.payment_status,
            amountAed: Number(b.cost_aed || 0),
            createdAt: b.created_at,
            userName: u?.full_name || u?.email?.split('@')[0] || 'Customer',
          };
        });

      setData({
        kpis,
        today,
        trend,
        zones,
        topOwners,
        recent: recent.slice(0, 12),
        funnel,
        zoneDonut,
        hourlyHeatmap: heatmap,
        recentBookings,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('useAdminStats fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchAll(false);
    const channel = supabase
      .channel('admin-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_bookings' }, () => fetchAll(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_listings' }, () => fetchAll(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_payments' }, () => fetchAll(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => fetchAll(true))
      .subscribe();

    const interval = window.setInterval(() => fetchAll(true), 60000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [fetchAll]);

  return { data, loading, refreshing, lastUpdated, refetch: () => fetchAll(true) };
}
