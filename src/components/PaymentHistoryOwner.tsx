import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Payment {
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
  status: string;
  booking_id?: string;
  booking_location?: string;
  booking_zone?: string;
  booking_start_time?: string;
  booking_end_time?: string;
}

export const PaymentHistoryOwner = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingDoc, setDownloadingDoc] = useState<{ paymentId: string; type: string } | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_my_payment_history');
      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (paymentId: string, documentType: 'invoice' | 'remittance') => {
    try {
      setDownloadingDoc({ paymentId, type: documentType });

      // Always regenerate to ensure the latest details/logo
      await supabase.functions.invoke('generate-payment-pdf', { body: { paymentId } });

      const { data, error } = await supabase.functions.invoke('generate-payment-document-url', {
        body: { paymentId, documentType }
      });

      if (error) throw error;

      if (!data?.url) throw new Error('No URL returned');

      // Fetch bytes and validate PDF signature
      const res = await fetch(data.url);
      if (!res.ok) throw new Error('Document URL not accessible');
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer).slice(0, 4);
      const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF

      if (!isPDF) {
        // Regenerate and retry once
        const { error: genErr } = await supabase.functions.invoke('generate-payment-pdf', { body: { paymentId } });
        if (genErr) throw genErr;
        const retry = await supabase.functions.invoke('generate-payment-document-url', { body: { paymentId, documentType } });
        if (retry.error || !retry.data?.url) throw retry.error || new Error('No URL after regenerate');
        const res2 = await fetch(retry.data.url);
        if (!res2.ok) throw new Error('Regenerated document URL failed');
        const buf2 = await res2.arrayBuffer();
        const bytes2 = new Uint8Array(buf2).slice(0, 4);
        const ok = bytes2[0] === 0x25 && bytes2[1] === 0x50 && bytes2[2] === 0x44 && bytes2[3] === 0x46;
        if (!ok) throw new Error('Document still invalid');
        const blob2 = new Blob([buf2], { type: 'application/pdf' });
        const url2 = window.URL.createObjectURL(blob2);
        const a2 = document.createElement('a');
        a2.href = url2;
        a2.download = `${documentType}_${paymentId}.pdf`;
        a2.click();
        window.URL.revokeObjectURL(url2);
        toast.success(`${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} downloaded`);
        return;
      }

      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}_${paymentId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} downloaded`);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error.message || 'Failed to download document');
    } finally {
      setDownloadingDoc(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No payment history available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Payment History</h3>
      </div>

      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">
                  {payment.listing_title || 'Payment Received'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(payment.payment_date), 'PPP')}
                </p>
              </div>
              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                {payment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-semibold text-lg">AED {payment.amount_aed.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Period</Label>
                <p>
                  {format(new Date(payment.payment_period_start), 'PP')} -{' '}
                  {format(new Date(payment.payment_period_end), 'PP')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Method</Label>
                <p>{payment.payment_method}</p>
              </div>
              {payment.reference_number && (
                <div>
                  <Label className="text-muted-foreground">Reference</Label>
                  <p className="font-mono text-xs">{payment.reference_number}</p>
                </div>
              )}
            </div>

            {payment.booking_id && (
              <div className="pt-2 border-t">
                <Label className="text-muted-foreground text-sm">Linked Booking</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md space-y-1">
                  <p className="text-sm font-medium">{payment.booking_location}</p>
                  {payment.booking_zone && (
                    <p className="text-xs text-muted-foreground">Zone: {payment.booking_zone}</p>
                  )}
                  {payment.booking_start_time && payment.booking_end_time && (
                    <p className="text-xs text-muted-foreground">
                      Rental: {format(new Date(payment.booking_start_time), 'PP')} - {format(new Date(payment.booking_end_time), 'PP')}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              {payment.invoice_url ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadDocument(payment.id, 'invoice')}
                  disabled={downloadingDoc?.paymentId === payment.id && downloadingDoc.type === 'invoice'}
                  className="w-full"
                >
                  {downloadingDoc?.paymentId === payment.id && downloadingDoc.type === 'invoice' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="w-full">
                  Invoice Not Available
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
