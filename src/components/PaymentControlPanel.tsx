import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PaymentControlPanel = () => {
  const { paymentsEnabled, disabledMessage, loading, error, togglePayments } = usePaymentSettings();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleTogglePayments = async () => {
    setIsToggling(true);
    
    try {
      const result = await togglePayments(!paymentsEnabled);
      
      if (result.success) {
        toast({
          title: "Payment Settings Updated",
          description: `Payments are now ${!paymentsEnabled ? 'enabled' : 'disabled'}`,
          variant: paymentsEnabled ? "destructive" : "default"
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update payment settings",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading payment settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading payment settings: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Control
          <Badge variant={paymentsEnabled ? "default" : "secondary"}>
            {paymentsEnabled ? "ENABLED" : "DISABLED"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/10">
          <div className="flex items-center gap-3">
            {paymentsEnabled ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold">
                Payment Processing
              </h3>
              <p className="text-sm text-muted-foreground">
                {paymentsEnabled 
                  ? "Users can complete full checkout with Stripe integration"
                  : "All bookings are saved in 'Pending Payment' status"
                }
              </p>
            </div>
          </div>
          <Switch
            checked={paymentsEnabled}
            onCheckedChange={handleTogglePayments}
            disabled={isToggling}
          />
        </div>

        {/* Payment Disabled Message */}
        {!paymentsEnabled && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Message shown to users:</strong>
              <br />
              <em>"{disabledMessage}"</em>
            </AlertDescription>
          </Alert>
        )}

        {/* Impact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Current Impact:</h4>
          {paymentsEnabled ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>New bookings proceed to Stripe checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Full payment integration active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Automatic email confirmations sent</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Bookings saved as "Pending Payment"</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Payment button disabled for users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Reservation emails still sent</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleTogglePayments}
            disabled={isToggling}
            className="w-full"
          >
            {isToggling ? "Updating..." : paymentsEnabled ? "Disable Payments" : "Enable Payments"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};