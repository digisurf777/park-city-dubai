import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Mail, Calendar, Clock, Search, Car, DollarSign, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react';
import { format, getDaysInMonth, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface DriverEmailRecord {
  booking_id: string;
  user_id: string;
  driver_name: string;
  driver_email: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  status: string;
  monthly_followup_sent: boolean;
  monthly_followup_sent_at: string | null;
  email_day: number;
  next_email_date: Date | null;
  emails_sent_count: number;
  is_active: boolean;
  first_month_passed: boolean;
}

interface OwnerEmailRecord {
  payment_id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  amount_aed: number;
  payment_date: string;
  payment_period_start: string;
  payment_period_end: string;
  status: string;
  payout_email_sent: boolean;
  payout_email_sent_at: string | null;
}

// Helper to get the effective day of month (handles month-end edge cases)
const getEffectiveDay = (startDay: number, month: number, year: number): number => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  return Math.min(startDay, daysInMonth);
};

// Check if at least one full month has passed
const hasOneMonthPassed = (startDate: Date, currentDate: Date): boolean => {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  const monthsDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
  if (monthsDiff > 1) return true;
  if (monthsDiff === 1) {
    const effectiveDay = getEffectiveDay(startDay, currentMonth, currentYear);
    return currentDay >= effectiveDay;
  }
  return false;
};

// Calculate next email date for anniversary-based system
const getNextEmailDate = (startTime: string, endTime: string): { date: Date | null; status: 'scheduled' | 'ended' | 'first_pending' | 'today' } => {
  const today = startOfDay(new Date());
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const emailDay = startDate.getDate();
  
  // If booking has ended
  if (isBefore(endDate, today)) {
    return { date: null, status: 'ended' };
  }
  
  // If first month hasn't passed yet
  if (!hasOneMonthPassed(startDate, today)) {
    // Calculate when first email will be sent
    let firstEmailDate = new Date(startDate);
    firstEmailDate.setMonth(firstEmailDate.getMonth() + 1);
    
    // Handle month-end edge cases
    const effectiveDay = getEffectiveDay(emailDay, firstEmailDate.getMonth(), firstEmailDate.getFullYear());
    firstEmailDate.setDate(effectiveDay);
    
    return { date: firstEmailDate, status: 'first_pending' };
  }
  
  // Calculate next anniversary date
  let nextDate = new Date(today.getFullYear(), today.getMonth(), emailDay);
  
  // Handle month-end edge cases
  const effectiveDay = getEffectiveDay(emailDay, nextDate.getMonth(), nextDate.getFullYear());
  nextDate.setDate(effectiveDay);
  
  // If today is past the email day this month, move to next month
  if (nextDate <= today) {
    nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextEffectiveDay = getEffectiveDay(emailDay, nextDate.getMonth(), nextDate.getFullYear());
    nextDate.setDate(nextEffectiveDay);
  }
  
  // Check if email is scheduled for today
  if (nextDate.getTime() === today.getTime()) {
    return { date: nextDate, status: 'today' };
  }
  
  return { date: nextDate, status: 'scheduled' };
};

// Count emails sent based on monthly_followup_sent_at timestamps
const countEmailsSent = (lastSentAt: string | null, startTime: string): number => {
  if (!lastSentAt) return 0;
  
  const startDate = new Date(startTime);
  const lastSent = new Date(lastSentAt);
  
  // Calculate approximate months between start and last sent
  const monthsDiff = (lastSent.getFullYear() - startDate.getFullYear()) * 12 + 
                     (lastSent.getMonth() - startDate.getMonth());
  
  return Math.max(1, monthsDiff);
};

// Get ordinal suffix for day numbers
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export function MonthlyEmailsTab() {
  const [driverRecords, setDriverRecords] = useState<DriverEmailRecord[]>([]);
  const [ownerRecords, setOwnerRecords] = useState<OwnerEmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverSearch, setDriverSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('all');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState('all');

  const fetchEmailRecords = async () => {
    setLoading(true);
    try {
      // Fetch driver monthly check-in records (only active bookings that haven't ended)
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('id, user_id, location, zone, start_time, end_time, status, monthly_followup_sent, monthly_followup_sent_at')
        .in('status', ['confirmed', 'approved'])
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch owner payout records
      const { data: payments, error: paymentsError } = await supabase
        .from('owner_payments')
        .select('id, owner_id, amount_aed, payment_date, payment_period_start, payment_period_end, status, payout_email_sent, payout_email_sent_at')
        .eq('status', 'completed')
        .order('payout_email_sent_at', { ascending: false, nullsFirst: false });

      if (paymentsError) throw paymentsError;

      // Get unique user IDs for profile lookup
      const driverUserIds = [...new Set(bookings?.map(b => b.user_id) || [])];
      const ownerUserIds = [...new Set(payments?.map(p => p.owner_id) || [])];
      const allUserIds = [...new Set([...driverUserIds, ...ownerUserIds])];

      // Fetch profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', allUserIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const today = startOfDay(new Date());

      // Map driver records with anniversary calculations
      const mappedDriverRecords: DriverEmailRecord[] = (bookings || []).map(booking => {
        const profile = profileMap.get(booking.user_id);
        const startDate = new Date(booking.start_time);
        const endDate = new Date(booking.end_time);
        const emailDay = startDate.getDate();
        const { date: nextEmailDate, status: emailStatus } = getNextEmailDate(booking.start_time, booking.end_time);
        const isActive = isAfter(endDate, today) && ['confirmed', 'approved'].includes(booking.status);
        const firstMonthPassed = hasOneMonthPassed(startDate, today);
        
        return {
          booking_id: booking.id,
          user_id: booking.user_id,
          driver_name: profile?.full_name || 'Unknown Driver',
          driver_email: profile?.email || 'No email',
          location: booking.location,
          zone: booking.zone,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          monthly_followup_sent: booking.monthly_followup_sent || false,
          monthly_followup_sent_at: booking.monthly_followup_sent_at,
          email_day: emailDay,
          next_email_date: nextEmailDate,
          emails_sent_count: countEmailsSent(booking.monthly_followup_sent_at, booking.start_time),
          is_active: isActive,
          first_month_passed: firstMonthPassed
        };
      });

      // Map owner records
      const mappedOwnerRecords: OwnerEmailRecord[] = (payments || []).map(payment => {
        const profile = profileMap.get(payment.owner_id);
        return {
          payment_id: payment.id,
          owner_id: payment.owner_id,
          owner_name: profile?.full_name || 'Unknown Owner',
          owner_email: profile?.email || 'No email',
          amount_aed: payment.amount_aed,
          payment_date: payment.payment_date,
          payment_period_start: payment.payment_period_start,
          payment_period_end: payment.payment_period_end,
          status: payment.status,
          payout_email_sent: payment.payout_email_sent || false,
          payout_email_sent_at: payment.payout_email_sent_at
        };
      });

      setDriverRecords(mappedDriverRecords);
      setOwnerRecords(mappedOwnerRecords);
    } catch (error) {
      console.error('Error fetching email records:', error);
      toast.error('Failed to load email records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailRecords();
  }, []);

  // Filter driver records
  const filteredDriverRecords = driverRecords.filter(record => {
    const matchesSearch = !driverSearch || 
      record.driver_name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      record.driver_email.toLowerCase().includes(driverSearch.toLowerCase()) ||
      record.location.toLowerCase().includes(driverSearch.toLowerCase());
    
    let matchesStatus = true;
    if (driverStatusFilter === 'active') {
      matchesStatus = record.is_active;
    } else if (driverStatusFilter === 'ended') {
      matchesStatus = !record.is_active;
    } else if (driverStatusFilter === 'first_pending') {
      matchesStatus = record.is_active && !record.first_month_passed;
    } else if (driverStatusFilter === 'today') {
      const { status } = getNextEmailDate(record.start_time, record.end_time);
      matchesStatus = status === 'today';
    }
    
    return matchesSearch && matchesStatus;
  });

  // Filter owner records
  const filteredOwnerRecords = ownerRecords.filter(record => {
    const matchesSearch = !ownerSearch || 
      record.owner_name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      record.owner_email.toLowerCase().includes(ownerSearch.toLowerCase());
    
    const matchesStatus = ownerStatusFilter === 'all' || 
      (ownerStatusFilter === 'sent' && record.payout_email_sent) ||
      (ownerStatusFilter === 'pending' && !record.payout_email_sent);
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activeBookings = driverRecords.filter(r => r.is_active).length;
  const totalEmailsSent = driverRecords.reduce((sum, r) => sum + r.emails_sent_count, 0);
  const emailsToday = driverRecords.filter(r => {
    const { status } = getNextEmailDate(r.start_time, r.end_time);
    return status === 'today';
  }).length;
  const firstPending = driverRecords.filter(r => r.is_active && !r.first_month_passed).length;
  
  const ownerSentCount = ownerRecords.filter(r => r.payout_email_sent).length;
  const ownerPendingCount = ownerRecords.filter(r => !r.payout_email_sent).length;

  // Render email status badge for drivers
  const renderDriverEmailStatus = (record: DriverEmailRecord) => {
    const { status } = getNextEmailDate(record.start_time, record.end_time);
    
    if (status === 'ended') {
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Booking Ended
        </Badge>
      );
    }
    
    if (status === 'today') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Mail className="h-3 w-3 mr-1" />
          Email Today
        </Badge>
      );
    }
    
    if (status === 'first_pending') {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          <Clock className="h-3 w-3 mr-1" />
          First Email Pending
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-green-600 border-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Monthly Email History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchEmailRecords}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Car className="h-4 w-4" />
                Active Bookings
              </div>
              <p className="text-2xl font-bold text-green-600">{activeBookings}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Mail className="h-4 w-4" />
                Total Emails Sent
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalEmailsSent}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                Emails Today
              </div>
              <p className="text-2xl font-bold text-emerald-600">{emailsToday}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                First Email Pending
              </div>
              <p className="text-2xl font-bold text-yellow-600">{firstPending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>
            <strong>Anniversary-Based System:</strong> Cron runs daily at 9:00 AM UAE time. 
            Each booking receives emails on its start date anniversary (e.g., started on 15th → emails on 15th of each month).
          </span>
        </div>

        {/* Tabs for Driver and Owner */}
        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Driver Check-ins ({filteredDriverRecords.length})
            </TabsTrigger>
            <TabsTrigger value="owners" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Owner Payouts ({filteredOwnerRecords.length})
            </TabsTrigger>
          </TabsList>

          {/* Driver Check-ins Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={driverStatusFilter} onValueChange={setDriverStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="first_pending">First Email Pending</SelectItem>
                  <SelectItem value="today">Email Today</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading driver records...</p>
              </div>
            ) : filteredDriverRecords.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No driver email records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Email Day</TableHead>
                      <TableHead>Next Email</TableHead>
                      <TableHead>Emails Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDriverRecords.map((record) => (
                      <TableRow key={record.booking_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.driver_name}</p>
                            <p className="text-muted-foreground text-sm">{record.driver_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{record.location}</p>
                            <p className="text-muted-foreground">{record.zone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {record.email_day}{getOrdinalSuffix(record.email_day)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.next_email_date ? (
                            <div className="text-sm">
                              <p className="font-medium">{format(record.next_email_date, 'MMM d, yyyy')}</p>
                              <p className="text-muted-foreground">
                                {format(new Date(record.start_time), 'MMM d')} - {format(new Date(record.end_time), 'MMM d, yyyy')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {record.emails_sent_count} {record.emails_sent_count === 1 ? 'email' : 'emails'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderDriverEmailStatus(record)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.monthly_followup_sent_at 
                            ? format(new Date(record.monthly_followup_sent_at), 'MMM d, yyyy')
                            : '—'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Owner Payouts Tab */}
          <TabsContent value="owners" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Owner Emails Sent
                  </div>
                  <p className="text-2xl font-bold text-green-600">{ownerSentCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Owner Emails Pending
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{ownerPendingCount}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={ownerStatusFilter} onValueChange={setOwnerStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading owner records...</p>
              </div>
            ) : filteredOwnerRecords.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No owner email records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Payment Amount</TableHead>
                      <TableHead>Payment Period</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Sent Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOwnerRecords.map((record) => (
                      <TableRow key={record.payment_id}>
                        <TableCell className="font-medium">{record.owner_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{record.owner_email}</TableCell>
                        <TableCell className="font-medium">AED {record.amount_aed.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(record.payment_period_start), 'MMM d')} - {format(new Date(record.payment_period_end), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.payout_email_sent ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.payout_email_sent_at 
                            ? format(new Date(record.payout_email_sent_at), 'MMM d, yyyy h:mm a')
                            : '—'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
