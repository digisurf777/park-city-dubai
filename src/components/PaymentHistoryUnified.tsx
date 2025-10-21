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
              .select('driver_id, owner_id'),
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

        const driverMap = new Map<string, { count: number; total: number }>();
        for (const row of driverRows as any[]) {
          if (!row.user_id) continue;
          const prev = driverMap.get(row.user_id) || { count: 0, total: 0 };
          driverMap.set(row.user_id, { count: prev.count + 1, total: prev.total + Number(row.cost_aed || 0) });
        }

        const ownerMap = new Map<string, { count: number; total: number }>();
        for (const row of ownerRows as any[]) {
          if (!row.owner_id) continue;
          const prev = ownerMap.get(row.owner_id) || { count: 0, total: 0 };
          ownerMap.set(row.owner_id, { count: prev.count + 1, total: prev.total + Number(row.amount_aed || 0) });
        }

        // Count listings (approved/published) as owner signal
        for (const row of listingRows as any[]) {
          if (!row.owner_id) continue;
          const status = (row.status || '').toLowerCase();
          if (status === 'approved' || status === 'published') {
            const prev = ownerMap.get(row.owner_id) || { count: 0, total: 0 };
            ownerMap.set(row.owner_id, { count: prev.count + 1, total: prev.total });
          }
        }

        // Count deposit payments as owner signal
        for (const row of depositRows as any[]) {
          if (!row.owner_id) continue;
          const prev = ownerMap.get(row.owner_id) || { count: 0, total: 0 };
          ownerMap.set(row.owner_id, { count: prev.count + 1, total: prev.total });
        }

        // Include chat participants
        const chatUserIds = new Set<string>();
        for (const row of chatRows as any[]) {
          if (row.driver_id) chatUserIds.add(row.driver_id);
          if (row.owner_id) chatUserIds.add(row.owner_id);
        }

        const userIds = Array.from(new Set<string>([...driverMap.keys(), ...ownerMap.keys(), ...chatUserIds]));
        if (userIds.length === 0) {
          setCustomers([]);
          return;
        }

        // Use the helper function to get proper names and emails
        const { data: identities, error: identitiesError } = await supabase.rpc('get_user_identities', { user_ids: userIds });
        
        if (identitiesError) {
          console.error('Failed to fetch user identities:', identitiesError);
          throw identitiesError;
        }

        const identityMap = new Map<string, { full_name: string; email: string }>();
        (identities || []).forEach((i: any) => identityMap.set(i.user_id, { full_name: i.full_name, email: i.email }));

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
        setCustomers(primary.data || []);
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

      // Fetch driver bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('parking_bookings')
        .select('id, location, zone, start_time, end_time, cost_aed, status, invoice_url, created_at')
        .eq('user_id', userId)
        .in('status', ['confirmed', 'completed', 'approved'])
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setCustomerBookings(bookings || []);

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

    try {
      setUploadingDoc({ id: paymentId, type: documentType });

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) throw new Error('Failed to read file');

        console.log('📤 Uploading owner payment document:', { paymentId, documentType, fileName: file.name });

        const { data, error } = await supabase.functions.invoke('upload-payment-document', {
          body: {
            paymentId,
            documentType,
            fileName: file.name,
            fileData: base64
          }
        });

        if (error) {
          console.error('❌ Upload error:', error);
          throw error;
        }

        console.log('✅ Upload success:', data);
        toast.success(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} uploaded successfully! Customer will receive this exact file.`, {
          duration: 5000,
        });
        if (selectedCustomerId) fetchCustomerDetails(selectedCustomerId);
      };
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`, {
        duration: 5000,
      });
    } finally {
      setUploadingDoc(null);
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
                        <Badge variant="secondary">
                          Driver ({customer.driver_bookings_count})
                        </Badge>
                      )}
                      {customer.owner_payments_count > 0 && (
                        <Badge variant="outline">
                          Owner ({customer.owner_payments_count})
                        </Badge>
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
                    Driver Bookings ({customerBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1">
                    Owner Payments ({ownerPayments.length})
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
    </div>
  );
};
