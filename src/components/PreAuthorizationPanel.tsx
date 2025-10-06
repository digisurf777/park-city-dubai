import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, DollarSign, Clock, CreditCard, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
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

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    setDeleting(bookingToDelete);
    try {
      const { data, error } = await supabase.rpc('admin_delete_booking_complete', {
        booking_id: bookingToDelete
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pre-authorization deleted successfully",
      });

      // Remove from local state
      setPreAuthorizations(prev => prev.filter(auth => auth.booking_id !== bookingToDelete));
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error: any) {
      console.error('Error deleting pre-authorization:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete pre-authorization",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
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

  const summaryStats = {
    totalActive: preAuthorizations.length,
    expiringSoon: preAuthorizations.filter(auth => auth.days_until_expiry <= 2).length,
    totalAuthorized: preAuthorizations.reduce((sum, auth) => sum + auth.pre_authorization_amount, 0),
    readyToCapture: preAuthorizations.filter(auth => auth.payment_status === 'pre_authorized').length,
    recentlyCaptured: preAuthorizations.filter(auth => auth.payment_status === 'confirmed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Pre-Authorization Dashboard
        </h2>
        <Button onClick={fetchPreAuthorizations} variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{summaryStats.totalActive}</div>
                <div className="text-sm text-blue-700">Active Pre-Auths</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-900">{summaryStats.expiringSoon}</div>
                <div className="text-sm text-red-700">Expiring Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-900">AED {(summaryStats.totalAuthorized / 100).toLocaleString()}</div>
                <div className="text-sm text-green-700">Total Authorized</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{summaryStats.readyToCapture}</div>
                <div className="text-sm text-orange-700">Ready to Capture</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{summaryStats.recentlyCaptured}</div>
                <div className="text-sm text-purple-700">Captured</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {preAuthorizations.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pre-Authorizations Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              Pre-authorizations allow you to hold funds on customer cards before capturing payments. 
              They'll appear here when customers make bookings.
            </p>
            <div className="text-sm text-gray-400">
              💡 Tip: Pre-auths typically expire in 7 days and can be extended up to 3 times
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {preAuthorizations.map((auth) => (
            <Card key={auth.booking_id} className="overflow-hidden border-l-4 border-l-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 bg-gradient-to-r from-muted/20 to-background">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {auth.location}
                  </CardTitle>
                  {getStatusBadge(auth.payment_status, auth.days_until_expiry)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer: <span className="font-medium">{auth.user_full_name}</span> • Zone: <span className="font-medium">{auth.zone}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-700">Authorized Amount</div>
                    <div className="flex items-center gap-1 text-blue-900">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">AED {(auth.pre_authorization_amount / 100).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-700">Captured</div>
                    <div className="font-bold text-green-900">AED {auth.capture_amount ? (auth.capture_amount / 100).toLocaleString() : '0'}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-700">Security Deposit</div>
                    <div className="font-bold text-purple-900">AED {(auth.security_deposit_amount / 100).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-700">Expires In</div>
                    <div className="flex items-center gap-1 font-bold text-orange-900">
                      <Calendar className="w-4 h-4" />
                      {auth.days_until_expiry} days
                    </div>
                  </div>
                </div>

                {auth.days_until_expiry <= 1 && (
                  <Alert className="border-red-200 bg-red-50 animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">
                      ⚠️ This authorization expires in {auth.days_until_expiry} day(s)! Capture or extend soon.
                    </AlertDescription>
                  </Alert>
                )}

                {auth.payment_status === 'pre_authorized' && (
                  <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Capture Options
                    </h4>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`capture-${auth.booking_id}`} className="text-sm font-medium">Partial Capture Amount (AED)</Label>
                        <Input
                          id={`capture-${auth.booking_id}`}
                          type="number"
                          placeholder={`Max: ${(auth.pre_authorization_amount / 100).toFixed(0)}`}
                          value={captureAmounts[auth.booking_id] || ''}
                          onChange={(e) => setCaptureAmounts(prev => ({
                            ...prev,
                            [auth.booking_id]: parseFloat(e.target.value) || 0
                          }))}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      <Button
                        onClick={() => handleCapture(auth.booking_id, false)}
                        disabled={capturing === auth.booking_id || !captureAmounts[auth.booking_id]}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {capturing === auth.booking_id ? 'Processing...' : 'Partial Capture'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCapture(auth.booking_id, true)}
                        disabled={capturing === auth.booking_id}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 font-medium"
                      >
                        {capturing === auth.booking_id ? 'Capturing...' : '💳 Capture Full Amount'}
                      </Button>
                      <Button
                        onClick={() => handleExtendAuthorization(auth.booking_id)}
                        disabled={extending === auth.booking_id || auth.authorization_extended_count >= 3}
                        variant="outline"
                        size="sm"
                        className="font-medium"
                      >
                        {extending === auth.booking_id ? 'Extending...' : '🕐 Extend 7 Days'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(auth.booking_id)}
                        disabled={deleting === auth.booking_id}
                        variant="destructive"
                        size="sm"
                        className="font-medium"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting === auth.booking_id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                    {auth.authorization_extended_count >= 3 && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        ⚠️ Maximum extensions reached (3/3) - Cannot extend further
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pre-Authorization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pre-authorization? This action cannot be undone and will remove the booking completely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};