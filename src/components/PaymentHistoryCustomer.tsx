import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
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
}

export default function PaymentHistoryCustomer() {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // SECURITY: Use RPC function instead of direct table access to prevent exposure of Stripe payment IDs
      const { data, error } = await supabase.rpc("get_my_bookings");

      if (error) throw error;
      
      // Show paid/confirmed bookings, or any booking that already has an invoice (admin-uploaded)
      const filteredData = (data || []).filter((booking: BookingPayment) =>
        (["confirmed", "completed"].includes(booking.status) &&
         ["pre_authorized", "confirmed", "paid", "completed"].includes(booking.payment_status || "")) ||
        !!booking.invoice_url
      );
      
      setPayments(filteredData);
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

  const getMonths = (p: BookingPayment) => {
    const start = new Date(p.start_time);
    const end = new Date(p.end_time);
    const days = differenceInDays(end, start);
    const months = Math.round(days / 30);
    
    if (months >= 1) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleDownloadInvoice = async (payment: BookingPayment) => {
    setDownloadingId(payment.id);
    try {
      // Only generate if no invoice exists yet (preserve admin-uploaded invoices)
      if (!payment.invoice_url) {
        const { data: generateData, error: generateError } = await supabase.functions.invoke(
          "generate-booking-invoice",
          {
            body: { booking_id: payment.id },
          }
        );
        if (generateError) throw generateError;
      }

      // Get auth token for the download request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Use direct Supabase URL
      const downloadUrl = `https://eoknluyunximjlsnyceb.supabase.co/functions/v1/download-invoice?booking_id=${payment.id}`;
      
      // Fetch the PDF as blob
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to download invoice');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${payment.id.slice(0, 8)}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

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
        <h3 className="text-lg font-semibold">My Booking Payments</h3>
        <p className="text-sm text-muted-foreground">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{payment.location}</span>
                <span className="text-primary font-bold">{payment.cost_aed} AED</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {payment.zone && payment.zone !== 'Find Parking Page' && (
                  <div>
                    <p className="text-muted-foreground">Zone</p>
                    <p className="font-medium">{payment.zone}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{getMonths(payment)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(payment.start_time), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(new Date(payment.end_time), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{format(new Date(payment.created_at), "MMM dd, yyyy")}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                  {payment.invoice_url?.includes('/booking_') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Custom Invoice
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    ID: {payment.id.slice(0, 8)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadInvoice(payment)}
                  disabled={downloadingId === payment.id}
                >
                  {downloadingId === payment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
