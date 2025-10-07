import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
      const { data, error } = await supabase
        .from("parking_bookings")
        .select("id, location, zone, start_time, end_time, duration_hours, cost_aed, status, payment_status, payment_type, created_at, invoice_url")
        .in("status", ["confirmed", "completed"])
        .in("payment_status", ["pre_authorized", "confirmed", "paid", "completed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
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
    const start = new Date(p.start_time).getTime();
    const end = new Date(p.end_time).getTime();
    const months = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30)));
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    setDownloadingId(bookingId);
    try {
      // First, ensure invoice PDF exists
      const { data: generateData, error: generateError } = await supabase.functions.invoke(
        "generate-booking-invoice",
        {
          body: { booking_id: bookingId },
        }
      );

      if (generateError) throw generateError;

      // Then get the signed URL
      const { data: urlData, error: urlError } = await supabase.functions.invoke(
        "generate-booking-invoice-url",
        {
          body: { booking_id: bookingId },
        }
      );

      if (urlError) throw urlError;

      // Download the file
      const link = document.createElement("a");
      link.href = urlData.signed_url;
      link.download = `ShazamParking_Invoice_${bookingId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
                  <span className="text-xs text-muted-foreground">
                    ID: {payment.id.slice(0, 8)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadInvoice(payment.id)}
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
