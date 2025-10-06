import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, CheckCircle, XCircle, Clock, MapPin, User, Calendar, RefreshCw, Settings, Zap } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

interface BookingWithProfile {
  id: string;
  user_id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  status: string;
  payment_type?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  } | null;
}

interface LiveBookingControlProps {
  onRefresh?: () => void;
}

const LiveBookingControl = ({ onRefresh }: LiveBookingControlProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithProfile[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate'>('activate');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, zoneFilter, timeFilter]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('live-booking-control')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // First get only confirmed/approved bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('*')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then get user profiles for each booking
      const bookingsWithProfiles = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('user_id', booking.user_id)
            .single();

          return {
            ...booking,
            profiles: profileData || null
          };
        })
      );

      setBookings(bookingsWithProfiles as BookingWithProfile[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    const now = new Date();

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Zone filter
    if (zoneFilter !== 'all') {
      filtered = filtered.filter(booking => booking.zone === zoneFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(booking => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        
        switch (timeFilter) {
          case 'active':
            return isAfter(now, startTime) && isBefore(now, endTime);
          case 'upcoming':
            return isAfter(startTime, now);
          case 'completed':
            return isBefore(endTime, now);
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const toggleBookingStatus = async (bookingId: string, currentStatus: string) => {
    setUpdating(bookingId);
    try {
      let newStatus;
      
      // Determine new status based on current status
      if (currentStatus === 'pending' || currentStatus === 'cancelled') {
        newStatus = 'confirmed';
      } else if (currentStatus === 'confirmed') {
        newStatus = 'cancelled';
      } else {
        newStatus = currentStatus; // No change for other statuses
        return;
      }

      const { error } = await supabase
        .from('parking_bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${newStatus === 'confirmed' ? 'activated' : 'deactivated'} successfully`,
      });

      fetchBookings();
      onRefresh?.();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const togglePaymentType = async (bookingId: string, currentPaymentType?: string) => {
    setUpdating(bookingId);
    try {
      const newPaymentType = currentPaymentType === 'recurring' ? 'one_time' : 'recurring';
      
      const { error } = await supabase
        .from('parking_bookings')
        .update({ 
          payment_type: newPaymentType,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment type changed to ${newPaymentType === 'recurring' ? 'Auto' : 'Manual'}`,
      });

      fetchBookings();
      onRefresh?.();
    } catch (error) {
      console.error('Error updating payment type:', error);
      toast({
        title: "Error",
        description: "Failed to update payment type",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const bulkUpdateBookings = async () => {
    try {
      const newStatus = bulkAction === 'activate' ? 'confirmed' : 'cancelled';
      
      for (const bookingId of selectedBookings) {
        const { error } = await supabase
          .from('parking_bookings')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${selectedBookings.length} bookings ${bulkAction === 'activate' ? 'activated' : 'deactivated'} successfully`,
      });

      setShowBulkModal(false);
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      console.error('Error bulk updating bookings:', error);
      toast({
        title: "Error",
        description: "Failed to update bookings",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Currently Booked</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Available</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isAfter(now, start) && isBefore(now, end)) {
      return <Badge className="bg-blue-100 text-blue-800">Active Now</Badge>;
    } else if (isAfter(start, now)) {
      return <Badge className="bg-purple-100 text-purple-800">Upcoming</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
    }
  };

  const getUniqueZones = () => {
    return Array.from(new Set(bookings.map(booking => booking.zone))).filter(Boolean);
  };

  const getQuickToggleColor = (status: string) => {
    if (status === 'confirmed') {
      return 'text-red-600 hover:text-red-700 hover:bg-red-50';
    } else {
      return 'text-green-600 hover:text-green-700 hover:bg-green-50';
    }
  };

  const getQuickToggleIcon = (status: string) => {
    return status === 'confirmed' ? XCircle : CheckCircle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Approved Bookings</h2>
          <p className="text-muted-foreground">View and manage all approved parking bookings</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Currently Booked</p>
                <p className="text-2xl font-semibold">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold">{bookings.filter(b => b.status === 'cancelled').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-semibold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Currently Booked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Available</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zone</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {getUniqueZones().map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Status</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Times</SelectItem>
                  <SelectItem value="active">Active Now</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {selectedBookings.length > 0 && (
                <Button 
                  onClick={() => setShowBulkModal(true)} 
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Bulk Action ({selectedBookings.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookings(filteredBookings.map(b => b.id));
                        } else {
                          setSelectedBookings([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Time Status</TableHead>
                  <TableHead>Quick Toggle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const Icon = getQuickToggleIcon(booking.status);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookings([...selectedBookings, booking.id]);
                            } else {
                              setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{booking.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{booking.profiles?.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{booking.location}</div>
                            <div className="text-sm text-muted-foreground">{booking.zone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{format(new Date(booking.start_time), 'MMM d, HH:mm')}</div>
                            <div className="text-muted-foreground">to {format(new Date(booking.end_time), 'HH:mm')}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{booking.duration_hours}h</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {booking.cost_aed} AED
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePaymentType(booking.id, booking.payment_type)}
                          disabled={updating === booking.id}
                          className="min-w-[80px]"
                        >
                          {updating === booking.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            booking.payment_type === 'recurring' ? 'Auto' : 'Manual'
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{getTimeStatus(booking.start_time, booking.end_time)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBookingStatus(booking.id, booking.status)}
                          disabled={updating === booking.id || !['pending', 'confirmed', 'cancelled'].includes(booking.status)}
                          className={getQuickToggleColor(booking.status)}
                        >
                          {updating === booking.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Apply action to {selectedBookings.length} selected bookings:</p>
            <div className="flex items-center space-x-2">
              <Switch 
                id="bulk-action" 
                checked={bulkAction === 'activate'}
                onCheckedChange={(checked) => setBulkAction(checked ? 'activate' : 'deactivate')}
              />
              <Label htmlFor="bulk-action">
                {bulkAction === 'activate' ? 'Make Currently Booked' : 'Make Available'}
              </Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={bulkUpdateBookings} className="flex-1">
                Apply {bulkAction === 'activate' ? 'Activation' : 'Deactivation'}
              </Button>
              <Button onClick={() => setShowBulkModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveBookingControl;