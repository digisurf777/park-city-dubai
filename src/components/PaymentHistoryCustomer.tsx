import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";

interface BookingPayment {
  id: string;
  location: string;
  zone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  cost_aed: number;
  status: string;
  payment_status: string;
  payment_type: string;
  created_at: string;
  invoice_url?: string;
  invoices?: BookingInvoice[];
}

interface BookingInvoice {
  id: string;
  booking_id: string;
  invoice_number: number;
  file_path: string;
  file_name: string;
  uploaded_at: string;
}

interface OwnerPayment {
  id: string;
  amount_aed: number;
  payment_period_start: string;
  payment_period_end: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  invoice_url?: string;
  created_at: string;
  payment_date?: string;
}

interface UnifiedPayment {
  id: string;
  type: 'booking' | 'owner';
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
  invoice_url?: string;
  details: BookingPayment | OwnerPayment;
}

export default function PaymentHistoryCustomer() {
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Fetch booking payments
      const { data: bookingsData, error: bookingsError } = await supabase.rpc("get_my_bookings");
      if (bookingsError) throw bookingsError;
      
      // Show paid/confirmed bookings, or any booking that already has an invoice (admin-uploaded)
      const filteredBookings = (bookingsData || []).filter((booking: BookingPayment) =>
        (["confirmed", "completed"].includes(booking.status) &&
         ["pre_authorized", "confirmed", "paid", "completed"].includes(booking.payment_status || "")) ||
        !!booking.invoice_url
      );

      // Fetch all invoices for these bookings
      const bookingIds = filteredBookings.map((b: BookingPayment) => b.id);
      const { data: invoicesData } = await supabase
        .from('booking_invoices')
        .select('*')
        .in('booking_id', bookingIds)
        .order('invoice_number', { ascending: true });

      // Attach invoices to bookings
      const bookingsWithInvoices = filteredBookings.map((booking: BookingPayment) => ({
        ...booking,
        invoices: (invoicesData || []).filter((inv: BookingInvoice) => inv.booking_id === booking.id)
      }));

      // Fetch owner payments for current user
      const { data: { user } } = await supabase.auth.getUser();
      const { data: ownerPayments, error: ownerError } = await supabase
        .from('owner_payments')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (ownerError) console.error("Error fetching owner payments:", ownerError);

      // Combine both types into unified format
      const unifiedPayments: UnifiedPayment[] = [
        ...bookingsWithInvoices.map((b: BookingPayment) => ({
          id: b.id,
          type: 'booking' as const,
          amount: b.cost_aed,
          period_start: b.start_time,
          period_end: b.end_time,
          status: b.status,
          created_at: b.created_at,
          invoice_url: b.invoice_url,
          details: b,
        })),
        ...(ownerPayments || []).map((p: OwnerPayment) => ({
          id: p.id,
          type: 'owner' as const,
          amount: p.amount_aed,
          period_start: p.payment_period_start,
          period_end: p.payment_period_end,
          status: 'paid',
          created_at: p.created_at,
          invoice_url: p.invoice_url,
          details: p,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setPayments(unifiedPayments);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonths = (p: UnifiedPayment) => {
    const start = new Date(p.period_start);
    const end = new Date(p.period_end);
    const days = differenceInDays(end, start);
    const months = Math.round(days / 30);
    
    if (months >= 1) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleDownloadInvoice = async (payment: UnifiedPayment, invoiceFilePath?: string, invoiceNumber?: number) => {
    setDownloadingId(payment.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      if (payment.type === 'booking') {
        // Download specific booking invoice from booking_invoices table
        if (invoiceFilePath) {
          // Generate signed URL directly from the booking-invoices bucket
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('booking-invoices')
            .createSignedUrl(invoiceFilePath, 900); // 15 minutes

          if (signedUrlError || !signedUrlData) {
            throw new Error('Failed to generate download URL');
          }

          const response = await fetch(signedUrlData.signedUrl);
          if (!response.ok) throw new Error('Failed to download invoice');
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice_${invoiceNumber}_${payment.id.slice(0, 8)}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          // Fallback to old system if no specific invoice file path
          const downloadUrl = `https://eoknluyunximjlsnyceb.supabase.co/functions/v1/download-invoice?booking_id=${payment.id}`;
          const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${session.access_token}` },
          });

          if (!response.ok) throw new Error('Failed to download invoice');
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice_booking_${payment.id.slice(0, 8)}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      } else {
        // Download owner payment invoice
        if (!payment.invoice_url) {
          throw new Error('No invoice available for this payment');
        }

        const { data, error } = await supabase.functions.invoke('generate-payment-document-url', {
          body: { paymentId: payment.id, documentType: 'invoice' }
        });

        if (error) throw error;

        // Download using the signed URL
        const response = await fetch(data.url);
        if (!response.ok) throw new Error('Failed to download invoice');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_owner_${payment.id.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No payment history available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your completed bookings will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <p className="text-sm text-muted-foreground">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => {
          const isBooking = payment.type === 'booking';
          const bookingDetails = isBooking ? payment.details as BookingPayment : null;
          const ownerDetails = !isBooking ? payment.details as OwnerPayment : null;

          return (
            <Card key={payment.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isBooking ? (
                      <span>{bookingDetails?.location}</span>
                    ) : (
                      <span>Owner Payment</span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {isBooking ? 'Booking' : 'Owner'}
                    </span>
                  </div>
                  <span className="text-primary font-bold">{payment.amount} AED</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {isBooking && bookingDetails?.zone && bookingDetails.zone !== 'Find Parking Page' && (
                    <div>
                      <p className="text-muted-foreground">Zone</p>
                      <p className="font-medium">{bookingDetails.zone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{getMonths(payment)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(payment.period_start), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(new Date(payment.period_end), "MMM dd, yyyy")}</p>
                  </div>
                  {!isBooking && ownerDetails?.payment_method && (
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{ownerDetails.payment_method}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Payment Date</p>
                    <p className="font-medium">{format(new Date(payment.created_at), "MMM dd, yyyy")}</p>
                  </div>
                </div>

                {!isBooking && ownerDetails?.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Notes</p>
                    <p className="font-medium">{ownerDetails.notes}</p>
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                      {isBooking && bookingDetails?.invoices && bookingDetails.invoices.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bookingDetails.invoices.length} Invoice{bookingDetails.invoices.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {!isBooking && payment.invoice_url && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Invoice Available
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        ID: {payment.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  {isBooking && bookingDetails?.invoices && bookingDetails.invoices.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">Invoice History</p>
                      </div>
                      <div className="space-y-2 pl-6 border-l-2 border-muted">
                        {bookingDetails.invoices.map((invoice: BookingInvoice) => (
                          <div key={invoice.id} className="relative">
                            <div className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-primary" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(payment, invoice.file_path, invoice.invoice_number)}
                            disabled={downloadingId === payment.id}
                            className="w-full justify-between"
                          >
                            <div className="flex flex-col items-start gap-1 flex-1">
                              <span className="flex items-center gap-2 font-medium">
                                <FileCheck className="h-4 w-4" />
                                Invoice #{invoice.invoice_number}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Uploaded {format(new Date(invoice.uploaded_at), "MMM dd, yyyy")}
                              </span>
                            </div>
                            {downloadingId === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            ) : (
                              <Download className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isBooking && payment.invoice_url && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 pb-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold">Invoice</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(payment)}
                        disabled={downloadingId === payment.id}
                        className="w-full"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <FileCheck className="h-4 w-4" />
                          <span>Download Invoice</span>
                        </div>
                        {downloadingId === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <Download className="h-4 w-4 ml-2" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
