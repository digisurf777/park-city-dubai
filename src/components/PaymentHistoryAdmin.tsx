import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Upload, Download, FileText, Search, Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OwnerPayment {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  listing_id?: string;
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
}

interface Owner {
  id: string;
  full_name: string;
  email: string;
}

export const PaymentHistoryAdmin = () => {
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<{ paymentId: string; type: 'invoice' | 'remittance' } | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchOwners();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_owner_payment_history');
      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      // Get unique owners from parking listings
      const { data, error } = await supabase
        .from('parking_listings')
        .select(`
          owner_id,
          profiles!inner(full_name, email)
        `)
        .eq('status', 'approved');

      if (error) throw error;

      const uniqueOwners = Array.from(
        new Map(
          (data || []).map(item => [
            item.owner_id,
            {
              id: item.owner_id,
              full_name: (item.profiles as any)?.full_name || 'Unknown',
              email: (item.profiles as any)?.email || ''
            }
          ])
        ).values()
      );

      setOwners(uniqueOwners);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedOwnerId || !amount || !periodStart || !periodEnd) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('owner_payments')
        .insert({
          owner_id: selectedOwnerId,
          amount_aed: parseFloat(amount),
          payment_period_start: periodStart,
          payment_period_end: periodEnd,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          notes: notes,
          status: 'completed'
        });

      if (error) throw error;

      toast.success('Payment record created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment record');
    }
  };

  const handleUploadDocument = async (paymentId: string, documentType: 'invoice' | 'remittance', file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingDoc({ paymentId, type: documentType });

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) throw new Error('Failed to read file');

        const { error } = await supabase.functions.invoke('upload-payment-document', {
          body: {
            paymentId,
            documentType,
            fileName: file.name,
            fileData: base64
          }
        });

        if (error) throw error;

        toast.success(`${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} uploaded successfully`);
        fetchPayments();
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const resetForm = () => {
    setSelectedOwnerId('');
    setAmount('');
    setPeriodStart('');
    setPeriodEnd('');
    setPaymentMethod('Bank Transfer');
    setReferenceNumber('');
    setNotes('');
  };

  const filteredPayments = payments.filter(p =>
    p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Payment History</h2>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Payment
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by owner name or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{payment.owner_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{payment.owner_email}</p>
                </div>
                <Badge>{payment.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-semibold">AED {payment.amount_aed.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Date</Label>
                  <p>{format(new Date(payment.payment_date), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Period</Label>
                  <p>
                    {format(new Date(payment.payment_period_start), 'PP')} - {format(new Date(payment.payment_period_end), 'PP')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reference</Label>
                  <p>{payment.reference_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <div className="flex-1">
                  <Label className="text-sm">Invoice</Label>
                  {payment.invoice_url ? (
                    <Badge variant="outline" className="w-full justify-center">
                      <FileText className="h-3 w-3 mr-1" /> Uploaded
                    </Badge>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument(payment.id, 'invoice', file);
                        }}
                        disabled={uploadingDoc?.paymentId === payment.id && uploadingDoc.type === 'invoice'}
                        className="cursor-pointer"
                      />
                      {uploadingDoc?.paymentId === payment.id && uploadingDoc.type === 'invoice' && (
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-sm">Remittance Advice</Label>
                  {payment.remittance_advice_url ? (
                    <Badge variant="outline" className="w-full justify-center">
                      <FileText className="h-3 w-3 mr-1" /> Uploaded
                    </Badge>
                  ) : (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument(payment.id, 'remittance', file);
                        }}
                        disabled={uploadingDoc?.paymentId === payment.id && uploadingDoc.type === 'remittance'}
                        className="cursor-pointer"
                      />
                      {uploadingDoc?.paymentId === payment.id && uploadingDoc.type === 'remittance' && (
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payment Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Owner *</Label>
              <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.full_name} ({owner.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (AED) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Period Start *</Label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>
              <div>
                <Label>Period End *</Label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Reference Number</Label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePayment}>
                Create Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
