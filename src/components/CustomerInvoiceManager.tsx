import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Search, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
interface CustomerBooking {
  id: string;
  user_id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  cost_aed: number;
  status: string;
  invoice_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}
export const CustomerInvoiceManager = () => {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchBookings();
  }, []);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('parking_bookings').select(`
          id,
          user_id,
          location,
          zone,
          start_time,
          end_time,
          cost_aed,
          status,
          invoice_url,
          created_at
        `).in('status', ['confirmed', 'completed', 'approved']).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Fetch customer names/emails using a secure RPC that falls back to auth.users
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(b => b.user_id))];
        const {
          data: userInfos,
          error: rpcError
        } = await supabase.rpc('get_user_basic_info', {
          user_ids: userIds as any
        });
        if (rpcError) {
          console.error('get_user_basic_info RPC error:', rpcError);
        }
        const infoMap = new Map((userInfos || []).map((u: any) => [u.user_id, {
          full_name: u.full_name,
          email: u.email
        }]));
        const bookingsWithProfiles = data.map(booking => ({
          ...booking,
          profiles: infoMap.get(booking.user_id) || undefined
        }));
        setBookings(bookingsWithProfiles as CustomerBooking[]);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (bookingId: string, customerUserId: string, file: File) => {
    if (!file.type.includes('pdf')) {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    setUploadingId(bookingId);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) resolve(base64);else reject(new Error('Failed to read file'));
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileData = await base64Promise;

      // Upload via edge function
      const {
        data,
        error
      } = await supabase.functions.invoke('admin-upload-customer-invoice', {
        body: {
          bookingId,
          customerUserId,
          fileName: file.name,
          fileData
        }
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Invoice uploaded successfully"
      });

      // Refresh bookings
      fetchBookings();
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload invoice",
        variant: "destructive"
      });
    } finally {
      setUploadingId(null);
    }
  };
  const handleDownloadInvoice = async (bookingId: string) => {
    setDownloadingId(bookingId);
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');
      const response = await fetch(`https://eoknluyunximjlsnyceb.supabase.co/functions/v1/download-invoice?booking_id=${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Invoice downloaded successfully"
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return booking.profiles?.full_name?.toLowerCase().includes(searchLower) || booking.profiles?.email?.toLowerCase().includes(searchLower) || booking.location.toLowerCase().includes(searchLower) || booking.id.toLowerCase().includes(searchLower);
  });
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Invoices</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by customer, email, location..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map(booking => <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {booking.profiles?.full_name || booking.profiles?.email || 'Unknown Customer'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {booking.profiles?.email}
                  </p>
                </div>
                {booking.invoice_url && (
                  <Badge variant="default">Invoice Available</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{booking.location}</p>
                  <p className="text-xs text-muted-foreground">{booking.zone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Dates
                  </p>
                  <p className="font-medium text-xs">
                    {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    to {format(new Date(booking.end_time), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Amount
                  </p>
                  <p className="font-medium">{booking.cost_aed} AED</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/pdf';
              input.onchange = e => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(booking.id, booking.user_id, file);
              };
              input.click();
            }} disabled={uploadingId === booking.id}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingId === booking.id ? 'Uploading...' : 'Upload Invoice'}
                </Button>

                {booking.invoice_url && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleDownloadInvoice(booking.id)}
                    disabled={downloadingId === booking.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadingId === booking.id ? 'Downloading...' : 'Download Invoice'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>)}

        {filteredBookings.length === 0 && <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No bookings found matching your search' : 'No customer bookings available'}
              </p>
            </CardContent>
          </Card>}
      </div>
    </div>;
};