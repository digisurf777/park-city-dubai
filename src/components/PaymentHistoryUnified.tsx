import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, Download, FileText, User, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
interface UnifiedCustomer {
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  driver_bookings_count: number;
  owner_payments_count: number;
  total_driver_spent: number;
  total_owner_received: number;
  verification_status: string;
}

interface CustomerBooking {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  cost_aed: number;
  status: string;
  invoice_url: string | null;
  created_at: string;
}

interface OwnerPayment {
  id: string;
  listing_title?: string;
  payment_date: string;
  amount_aed: number;
  payment_period_start: string;
  payment_period_end: string;
  payment_method: string;
  reference_number?: string;
  invoice_url?: string;
  remittance_advice_url?: string;
  notes?: string;
  status: string;
  booking_location?: string;
}

export const PaymentHistoryUnified = () => {
  const [customers, setCustomers] = useState<UnifiedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'drivers' | 'owners' | 'both'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([]);
  const [ownerPayments, setOwnerPayments] = useState<OwnerPayment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<{ id: string; type: string } | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<{ id: string; type: string } | null>(null);
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount_aed: '',
    payment_period_start: '',
    payment_period_end: '',
    payment_method: 'Bank Transfer',
    reference_number: '',
    notes: ''
  });
  const [newPaymentFile, setNewPaymentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerDetails(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Try primary RPC first
      const primary = await supabase.rpc('get_unified_customer_payment_history');
      if (primary.error) {
        console.warn('Primary RPC failed, falling back to get_unified_customers:', primary.error.message || primary.error);
      }

      if (!primary.data || primary.error) {
        // Active-only fallback: include users who booked, received payments, or participated in chat
          const [bookingsRes, paymentsRes, chatRes, listingsRes, depositsRes] = await Promise.all([
            supabase
              .from('parking_bookings')
              .select('user_id, cost_aed, status')
              .in('status', ['pending', 'approved', 'confirmed', 'completed']),
            supabase
              .from('owner_payments')
              .select('owner_id, amount_aed, status'),
            supabase
              .from('driver_owner_messages')
              .select('driver_id, owner_id, is_expired')
              .eq('is_expired', false),
            supabase
              .from('parking_listings')
              .select('owner_id, status'),
            supabase
              .from('deposit_payments')
              .select('owner_id')
          ]);

        if (bookingsRes.error) console.warn('Bookings fallback error:', bookingsRes.error);
        if (paymentsRes.error) console.warn('Owner payments fallback error:', paymentsRes.error);
        if (chatRes.error) console.warn('Chat fallback error:', chatRes.error);
        if (listingsRes.error) console.warn('Listings fallback error:', listingsRes.error);
        if (depositsRes.error) console.warn('Deposits fallback error:', depositsRes.error);

        const driverRows = bookingsRes.data || [];
        const ownerRows = paymentsRes.data || [];
        const chatRows = chatRes.data || [];
        const listingRows = listingsRes.data || [];
        const depositRows = depositsRes.data || [];

        // Build role counts strictly from active chat threads
        const driverMap = new Map<string, { count: number; total: number }>();
        const ownerMap = new Map<string, { count: number; total: number }>();
        for (const row of chatRows as any[]) {
          if (row.driver_id) {
            const prev = driverMap.get(row.driver_id) || { count: 0, total: 0 };
            driverMap.set(row.driver_id, { count: prev.count + 1, total: prev.total });
          }
          if (row.owner_id) {
            const prev = ownerMap.get(row.owner_id) || { count: 0, total: 0 };
            ownerMap.set(row.owner_id, { count: prev.count + 1, total: prev.total });
          }
        }

        // Include chat participants
        const chatUserIds = new Set<string>();
        for (const row of chatRows as any[]) {
          if (row.driver_id) chatUserIds.add(row.driver_id);
          if (row.owner_id) chatUserIds.add(row.owner_id);
        }

        // Include all users with approved/confirmed/completed bookings
        const bookingUserIds = new Set<string>();
        for (const row of driverRows as any[]) {
          if (row.user_id && ['approved', 'confirmed', 'completed'].includes(row.status)) {
            bookingUserIds.add(row.user_id);
          }
        }

        const userIds = Array.from(new Set<string>([...driverMap.keys(), ...ownerMap.keys(), ...chatUserIds, ...bookingUserIds]));
        if (userIds.length === 0) {
          setCustomers([]);
          return;
        }

        // Fetch identity data (name/email) for admin with robust fallbacks
        const { data: identities, error: identitiesError } = await supabase.rpc('get_user_basic_info', { user_ids: userIds });
        
        if (identitiesError) {
          console.error('Failed to fetch user identities:', identitiesError);
          throw identitiesError;
        }

        const identityMap = new Map<string, { full_name: string; email: string }>();
        (identities || []).forEach((i: any) => identityMap.set(i.user_id, { full_name: i.full_name || 'Customer', email: i.email || '' }));

        const mapped: UnifiedCustomer[] = userIds.map((id) => {
          const identity = identityMap.get(id);
          const driverCount = driverMap.get(id)?.count || 0;
          const ownerCount = ownerMap.get(id)?.count || 0;
          const userType = ownerCount > 0 && driverCount > 0
            ? 'both'
            : ownerCount > 0
            ? 'owner'
            : driverCount > 0
            ? 'driver'
            : 'seeker';
          return {
            user_id: id,
            full_name: (identity?.full_name || 'Customer') as string,
            email: (identity?.email || '') as string,
            user_type: userType,
            driver_bookings_count: driverCount,
            owner_payments_count: ownerCount,
            total_driver_spent: driverMap.get(id)?.total || 0,
            total_owner_received: ownerMap.get(id)?.total || 0,
            verification_status: 'not_verified',
          };
        });

        setCustomers(mapped);
      } else {
        // Restrict to active chat participants only
        const { data: chatOnly } = await supabase
          .from('driver_owner_messages')
          .select('driver_id, owner_id, is_expired')
          .eq('is_expired', false);
        const chatIds = new Set<string>();
        (chatOnly || []).forEach((r: any) => {
          if (r.driver_id) chatIds.add(r.driver_id);
          if (r.owner_id) chatIds.add(r.owner_id);
        });
        const filtered = (primary.data || []).filter((u: any) => chatIds.has(u.user_id));
        setCustomers(filtered);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (userId: string) => {
    try {
      setLoadingDetails(true);

      // Fetch driver bookings - include bookings with active chats
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('id, location, zone, start_time, end_time, cost_aed, status, invoice_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Filter bookings to show those with chat activity or confirmed status
      const { data: chatBookings } = await supabase
        .from('driver_owner_messages')
        .select('booking_id')
        .or(`driver_id.eq.${userId},owner_id.eq.${userId}`);

      const chatBookingIds = new Set(chatBookings?.map(c => c.booking_id) || []);
      const filteredBookings = (bookings || []).filter(b => 
        ['confirmed', 'completed', 'approved'].includes(b.status) || chatBookingIds.has(b.id)
      );

      if (bookingsError) throw bookingsError;
      setCustomerBookings(filteredBookings);

      // Fetch owner payments
      const { data: paymentsData, error: paymentsError } = await supabase.rpc('get_owner_payment_history');

      if (paymentsError) throw paymentsError;
      
      const filteredPayments = (paymentsData || []).filter((p: any) => p.owner_id === userId);
      setOwnerPayments(filteredPayments);
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBookingInvoiceUpload = async (bookingId: string, userId: string, file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setUploadingDoc({ id: bookingId, type: 'booking' });

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) throw new Error('Failed to read file');

        const { error } = await supabase.functions.invoke('admin-upload-customer-invoice', {
          body: {
            bookingId,
            customerUserId: userId,
            fileName: file.name,
            fileData: base64
          }
        });

        if (error) throw error;
        toast.success('Invoice uploaded successfully');
        fetchCustomerDetails(userId);
      };
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast.error('Failed to upload invoice');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleBookingInvoiceDownload = async (bookingId: string) => {
    try {
      setDownloadingDoc({ id: bookingId, type: 'booking' });

      console.log('📥 Downloading invoice for booking:', bookingId);

      const { data, error } = await supabase.functions.invoke('generate-booking-invoice-url', {
        body: { booking_id: bookingId }
      });

      if (error) {
        console.error('❌ Download error:', error);
        throw error;
      }
      if (!data?.signed_url) throw new Error('No URL returned');

      console.log('✅ Download URL generated');

      const link = document.createElement('a');
      link.href = data.signed_url;
      link.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('✅ Invoice downloaded successfully');
    } catch (error: any) {
      console.error('❌ Error downloading invoice:', error);
      toast.error(`Download failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleOwnerPaymentDownload = async (paymentId: string, documentType: 'invoice' | 'remittance') => {
    try {
      setDownloadingDoc({ id: paymentId, type: documentType });

      console.log('📥 Downloading owner payment document:', { paymentId, documentType });

      const { data, error } = await supabase.functions.invoke('generate-payment-document-url', {
        body: { paymentId, documentType }
      });

      if (error) {
        console.error('❌ Download error:', error);
        throw error;
      }
      if (!data?.url) throw new Error('No URL returned');

      console.log('✅ Download URL generated for owner payment');

      const link = document.createElement('a');
      link.href = data.url;
      link.download = `${documentType}_${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} downloaded`);
    } catch (error: any) {
      console.error('❌ Error downloading document:', error);
      toast.error(`Download failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleOwnerPaymentUpload = async (paymentId: string, documentType: 'invoice' | 'remittance', file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingDoc({ id: paymentId, type: documentType });

      console.log('📤 Uploading owner payment document directly to storage:', { paymentId, documentType, fileName: file.name, size: file.size });

      // Upload directly to storage (avoids edge function memory limits)
      const filePath = `${paymentId}/${documentType}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('owner-payment-documents')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded to storage:', filePath);

      // Now update the database records via edge function
      const { data, error } = await supabase.functions.invoke('update-payment-document-path', {
        body: {
          paymentId,
          documentType,
          filePath
        }
      });

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Database updated:', data);
      toast.success(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} uploaded successfully! Customer will receive this exact file.`, {
        duration: 5000,
      });
      if (selectedCustomerId) fetchCustomerDetails(selectedCustomerId);
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`, {
        duration: 5000,
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const createOwnerPayment = async () => {
    if (!selectedCustomerId) return;
    if (!newPayment.amount_aed || !newPayment.payment_period_start || !newPayment.payment_period_end) {
      toast.error('Amount and period are required');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('owner_payments')
        .insert({
          owner_id: selectedCustomerId,
          amount_aed: Number(newPayment.amount_aed),
          payment_period_start: newPayment.payment_period_start,
          payment_period_end: newPayment.payment_period_end,
          payment_method: newPayment.payment_method,
          reference_number: newPayment.reference_number || null,
          notes: newPayment.notes || null,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Owner payment created');

      if (newPaymentFile) {
        await handleOwnerPaymentUpload(data.id, 'invoice', newPaymentFile);
      }

      // Reset and refresh
      setNewPaymentOpen(false);
      setNewPayment({ amount_aed: '', payment_period_start: '', payment_period_end: '', payment_method: 'Bank Transfer', reference_number: '', notes: '' });
      setNewPaymentFile(null);
      await fetchCustomerDetails(selectedCustomerId);
    } catch (e: any) {
      console.error('Create payment error:', e);
      toast.error(e.message || 'Failed to create payment');
    }
  };
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      customerFilter === 'all' ||
      (customerFilter === 'drivers' && customer.driver_bookings_count > 0 && customer.owner_payments_count === 0) ||
      (customerFilter === 'owners' && customer.owner_payments_count > 0 && customer.driver_bookings_count === 0) ||
      (customerFilter === 'both' && customer.driver_bookings_count > 0 && customer.owner_payments_count > 0);

    return matchesSearch && matchesFilter;
  });

  const selectedCustomer = customers.find(c => c.user_id === selectedCustomerId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-muted-foreground">Manage all customer invoices in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCustomers}>
            Refresh
          </Button>
          <span className="text-sm text-muted-foreground hidden md:inline">
            {customers.length} customers
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={customerFilter} onValueChange={(v) => setCustomerFilter(v as any)} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="drivers">Drivers</TabsTrigger>
                <TabsTrigger value="owners">Owners</TabsTrigger>
                <TabsTrigger value="both">Both</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.user_id}
                onClick={() => setSelectedCustomerId(customer.user_id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedCustomerId === customer.user_id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer.full_name}</span>
                  </div>
                  {customer.verification_status === 'verified' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{customer.email}</p>
                <div className="flex gap-2">
                  {customer.driver_bookings_count > 0 && customer.owner_payments_count > 0 ? (
                    <Badge variant="default">Both</Badge>
                  ) : (
                    <>
                      {customer.driver_bookings_count > 0 && (
                        <Badge variant="secondary">Driver</Badge>
                      )}
                      {customer.owner_payments_count > 0 && (
                        <Badge variant="outline">Owner</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No customers found</p>
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedCustomer ? `${selectedCustomer.full_name}'s Invoices` : 'Select a customer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCustomer ? (
              <p className="text-center text-muted-foreground py-12">
                Select a customer from the list to view and manage their invoices
              </p>
            ) : loadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Tabs defaultValue="bookings" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="bookings" className="flex-1">
                    Driver Bookings
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1">
                    Owner Payments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bookings" className="space-y-4 mt-4">
                  {customerBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No bookings found</p>
                  ) : (
                    customerBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{booking.location}</p>
                                <p className="text-sm text-muted-foreground">{booking.zone}</p>
                              </div>
                              <Badge>{booking.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Start</p>
                                <p>{format(new Date(booking.start_time), 'MMM dd, yyyy HH:mm')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">End</p>
                                <p>{format(new Date(booking.end_time), 'MMM dd, yyyy HH:mm')}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="font-semibold">AED {booking.cost_aed}</span>
                              <div className="flex gap-2">
                                {booking.invoice_url ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBookingInvoiceDownload(booking.id)}
                                    disabled={downloadingDoc?.id === booking.id}
                                  >
                                    {downloadingDoc?.id === booking.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </>
                                    )}
                                  </Button>
                                ) : null}
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={uploadingDoc?.id === booking.id}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'application/pdf';
                                    input.onchange = (e: any) => {
                                      const file = e.target?.files?.[0];
                                      if (file && selectedCustomer) {
                                        handleBookingInvoiceUpload(booking.id, selectedCustomer.user_id, file);
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  {uploadingDoc?.id === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 mt-4">
                  {selectedCustomer && (selectedCustomer.user_type === 'owner' || selectedCustomer.user_type === 'both') && (
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setNewPaymentOpen(true)}>New Owner Payment</Button>
                    </div>
                  )}
                  {ownerPayments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No payments found</p>
                  ) : (
                    ownerPayments.map((payment) => (
                      <Card key={payment.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {payment.listing_title || payment.booking_location || 'Payment'}
                                </p>
                                <p className="text-sm text-muted-foreground">{payment.payment_method}</p>
                              </div>
                              <Badge>{payment.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Period Start</p>
                                <p>{format(new Date(payment.payment_period_start), 'MMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Period End</p>
                                <p>{format(new Date(payment.payment_period_end), 'MMM dd, yyyy')}</p>
                              </div>
                            </div>
                            {payment.reference_number && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Ref: </span>
                                {payment.reference_number}
                              </p>
                            )}
                            {payment.notes && (
                              <p className="text-sm text-muted-foreground">{payment.notes}</p>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="font-semibold">AED {payment.amount_aed}</span>
                              <div className="flex flex-wrap gap-2">
                                {/* Upload Invoice */}
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={uploadingDoc?.id === payment.id && uploadingDoc?.type === 'invoice'}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'application/pdf';
                                    input.onchange = (e: any) => {
                                      const file = e.target?.files?.[0];
                                      if (file) {
                                        handleOwnerPaymentUpload(payment.id, 'invoice', file);
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  {uploadingDoc?.id === payment.id && uploadingDoc?.type === 'invoice' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1" />
                                      UPLOAD INVOICE
                                    </>
                                  )}
                                </Button>
                                
                                {/* Upload Remittance */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={uploadingDoc?.id === payment.id && uploadingDoc?.type === 'remittance'}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'application/pdf';
                                    input.onchange = (e: any) => {
                                      const file = e.target?.files?.[0];
                                      if (file) {
                                        handleOwnerPaymentUpload(payment.id, 'remittance', file);
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  {uploadingDoc?.id === payment.id && uploadingDoc?.type === 'remittance' ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-1" />
                                      {payment.remittance_advice_url ? 'Replace Remittance' : 'Upload Remittance'}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={newPaymentOpen} onOpenChange={setNewPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Owner Payment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (AED)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={newPayment.amount_aed}
                onChange={(e) => setNewPayment((p) => ({ ...p, amount_aed: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Period Start</Label>
                <Input
                  id="start"
                  type="date"
                  value={newPayment.payment_period_start}
                  onChange={(e) => setNewPayment((p) => ({ ...p, payment_period_start: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">Period End</Label>
                <Input
                  id="end"
                  type="date"
                  value={newPayment.payment_period_end}
                  onChange={(e) => setNewPayment((p) => ({ ...p, payment_period_end: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <select
                id="method"
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment((p) => ({ ...p, payment_method: e.target.value }))}
              >
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Card</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference_number">Reference Number (optional)</Label>
              <Input
                id="reference_number"
                value={newPayment.reference_number}
                onChange={(e) => setNewPayment((p) => ({ ...p, reference_number: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice_file">Invoice PDF (optional)</Label>
              <Input
                id="invoice_file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setNewPaymentFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Only PDF files are accepted.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPaymentOpen(false)}>Cancel</Button>
            <Button onClick={createOwnerPayment}>Create Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
