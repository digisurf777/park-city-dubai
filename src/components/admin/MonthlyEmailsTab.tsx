import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Mail, Calendar, Clock, Search, Car, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
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
      // Fetch driver monthly check-in records
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('id, user_id, location, zone, start_time, end_time, status, monthly_followup_sent, monthly_followup_sent_at')
        .in('status', ['confirmed', 'approved', 'completed'])
        .order('monthly_followup_sent_at', { ascending: false, nullsFirst: false });

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

      // Map driver records
      const mappedDriverRecords: DriverEmailRecord[] = (bookings || []).map(booking => {
        const profile = profileMap.get(booking.user_id);
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
          monthly_followup_sent_at: booking.monthly_followup_sent_at
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
    
    const matchesStatus = driverStatusFilter === 'all' || 
      (driverStatusFilter === 'sent' && record.monthly_followup_sent) ||
      (driverStatusFilter === 'pending' && !record.monthly_followup_sent);
    
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
  const driverSentCount = driverRecords.filter(r => r.monthly_followup_sent).length;
  const driverPendingCount = driverRecords.filter(r => !r.monthly_followup_sent).length;
  const ownerSentCount = ownerRecords.filter(r => r.payout_email_sent).length;
  const ownerPendingCount = ownerRecords.filter(r => !r.payout_email_sent).length;

  // Next scheduled run (1st of each month at 9 AM UAE)
  const getNextScheduledRun = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
    return format(nextMonth, 'MMMM d, yyyy \'at\' h:mm a');
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
                Driver Emails Sent
              </div>
              <p className="text-2xl font-bold text-green-600">{driverSentCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Car className="h-4 w-4" />
                Driver Emails Pending
              </div>
              <p className="text-2xl font-bold text-yellow-600">{driverPendingCount}</p>
            </CardContent>
          </Card>
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

        {/* Next Scheduled Run */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>Next scheduled run: <strong>{getNextScheduledRun()}</strong> (UAE Time)</span>
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
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Booking Period</TableHead>
                      <TableHead>Booking Status</TableHead>
                      <TableHead>Email Status</TableHead>
                      <TableHead>Sent Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDriverRecords.map((record) => (
                      <TableRow key={record.booking_id}>
                        <TableCell className="font-medium">{record.driver_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{record.driver_email}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{record.location}</p>
                            <p className="text-muted-foreground">{record.zone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(record.start_time), 'MMM d')} - {format(new Date(record.end_time), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'confirmed' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.monthly_followup_sent ? (
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
                          {record.monthly_followup_sent_at 
                            ? format(new Date(record.monthly_followup_sent_at), 'MMM d, yyyy h:mm a')
                            : '-'
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
                            : '-'
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
