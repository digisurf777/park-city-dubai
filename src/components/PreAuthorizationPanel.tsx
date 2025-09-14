import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, DollarSign, Clock, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PreAuthorization {
  booking_id: string;
  user_full_name: string;
  location: string;
  zone: string;
  pre_authorization_amount: number;
  capture_amount: number | null;
  security_deposit_amount: number;
  pre_authorization_expires_at: string;
  payment_status: string;
  authorization_extended_count: number;
  days_until_expiry: number;
  created_at: string;
}

export const PreAuthorizationPanel = () => {
  const [preAuthorizations, setPreAuthorizations] = useState<PreAuthorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState<string | null>(null);
  const [extending, setExtending] = useState<string | null>(null);
  const [captureAmounts, setCaptureAmounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const fetchPreAuthorizations = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pre_authorization_overview');
      if (error) throw error;
      setPreAuthorizations(data || []);
    } catch (error) {
      console.error('Error fetching pre-authorizations:', error);
      toast({
        title: "Error",
        description: "Failed to load pre-authorizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreAuthorizations();
  }, []);

  const handleCapture = async (bookingId: string, fullAmount: boolean = true) => {
    setCapturing(bookingId);
    try {
      const captureData: any = { bookingId };
      
      if (!fullAmount && captureAmounts[bookingId]) {
        captureData.captureAmount = captureAmounts[bookingId];
      }

      const { data, error } = await supabase.functions.invoke('capture-pre-authorization', {
        body: captureData
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment ${fullAmount ? 'fully' : 'partially'} captured successfully`,
      });

      fetchPreAuthorizations();
    } catch (error: any) {
      console.error('Error capturing payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to capture payment",
        variant: "destructive"
      });
    } finally {
      setCapturing(null);
    }
  };

  const handleExtendAuthorization = async (bookingId: string, days: number = 7) => {
    setExtending(bookingId);
    try {
      const { data, error } = await supabase.rpc('extend_authorization_period', {
        booking_id: bookingId,
        additional_days: days
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Authorization extended by ${days} days`,
      });

      fetchPreAuthorizations();
    } catch (error: any) {
      console.error('Error extending authorization:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to extend authorization",
        variant: "destructive"
      });
    } finally {
      setExtending(null);
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    if (status === 'confirmed') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Captured</Badge>;
    }
    if (status === 'partially_captured') {
      return <Badge className="bg-blue-100 text-blue-800"><CreditCard className="w-3 h-3 mr-1" />Partial</Badge>;
    }
    if (daysUntilExpiry <= 1) {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Expiring Soon</Badge>;
    }
    if (daysUntilExpiry <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Expires Soon</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading pre-authorizations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pre-Authorization Management</h2>
        <Button onClick={fetchPreAuthorizations} variant="outline">
          Refresh
        </Button>
      </div>

      {preAuthorizations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No active pre-authorizations found
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {preAuthorizations.map((auth) => (
            <Card key={auth.booking_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{auth.location}</CardTitle>
                  {getStatusBadge(auth.payment_status, auth.days_until_expiry)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer: {auth.user_full_name} • Zone: {auth.zone}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Authorized Amount</div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      AED {(auth.pre_authorization_amount / 100).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Captured</div>
                    <div>AED {auth.capture_amount ? (auth.capture_amount / 100).toLocaleString() : '0'}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Security Deposit</div>
                    <div>AED {(auth.security_deposit_amount / 100).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Expires In</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {auth.days_until_expiry} days
                    </div>
                  </div>
                </div>

                {auth.days_until_expiry <= 1 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      This authorization expires in {auth.days_until_expiry} day(s)! Capture or extend soon.
                    </AlertDescription>
                  </Alert>
                )}

                {auth.payment_status === 'pre_authorized' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Capture Options</h4>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`capture-${auth.booking_id}`}>Partial Capture Amount (AED)</Label>
                        <Input
                          id={`capture-${auth.booking_id}`}
                          type="number"
                          placeholder={`Max: ${(auth.pre_authorization_amount / 100).toFixed(0)}`}
                          value={captureAmounts[auth.booking_id] || ''}
                          onChange={(e) => setCaptureAmounts(prev => ({
                            ...prev,
                            [auth.booking_id]: parseFloat(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <Button
                        onClick={() => handleCapture(auth.booking_id, false)}
                        disabled={capturing === auth.booking_id || !captureAmounts[auth.booking_id]}
                        variant="outline"
                        size="sm"
                      >
                        Partial Capture
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCapture(auth.booking_id, true)}
                        disabled={capturing === auth.booking_id}
                        size="sm"
                      >
                        {capturing === auth.booking_id ? 'Capturing...' : 'Capture Full Amount'}
                      </Button>
                      <Button
                        onClick={() => handleExtendAuthorization(auth.booking_id)}
                        disabled={extending === auth.booking_id || auth.authorization_extended_count >= 3}
                        variant="outline"
                        size="sm"
                      >
                        {extending === auth.booking_id ? 'Extending...' : 'Extend 7 Days'}
                      </Button>
                    </div>
                    {auth.authorization_extended_count >= 3 && (
                      <div className="text-xs text-red-600">
                        Maximum extensions reached (3/3)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};