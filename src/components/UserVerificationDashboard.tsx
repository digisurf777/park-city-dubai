import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationStatusBadge } from '@/components/VerificationStatusBadge';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface UserVerificationDashboardProps {
  onStartVerification?: () => void;
  onResubmitVerification?: () => void;
}

export const UserVerificationDashboard = ({ 
  onStartVerification, 
  onResubmitVerification 
}: UserVerificationDashboardProps) => {
  const { status: verificationStatus, loading, refresh } = useVerificationStatus();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getVerificationMessage = () => {
    switch (verificationStatus) {
      case 'approved':
      case 'verified':
        return {
          title: 'Account Verified ✅',
          description: 'Your account is fully verified. You can now access all features including listing parking spaces and making bookings.',
          variant: 'success' as const,
          showActions: false
        };
      case 'pending':
        return {
          title: 'Verification Pending ⏳',
          description: 'Your documents are being reviewed by our team. We will notify you once the verification is complete. This usually takes 1-2 business days.',
          variant: 'warning' as const,
          showActions: false
        };
      case 'rejected':
        return {
          title: 'Verification Rejected ❌',
          description: 'Your verification was rejected. Please resubmit your documents with the correct information. Check your inbox for detailed feedback.',
          variant: 'error' as const,
          showActions: true,
          actionText: 'Resubmit Documents',
          actionHandler: onResubmitVerification
        };
      default:
        return {
          title: 'Verification Required ⚠️',
          description: 'To access all features including listing parking spaces and making bookings, please complete the verification process by submitting your ID documents.',
          variant: 'warning' as const,
          showActions: true,
          actionText: 'Start Verification',
          actionHandler: onStartVerification
        };
    }
  };

  const message = getVerificationMessage();

  return (
    <Card className={`
      ${message.variant === 'success' ? 'border-green-200 bg-green-50' : ''}
      ${message.variant === 'warning' ? 'border-orange-200 bg-orange-50' : ''}
      ${message.variant === 'error' ? 'border-red-200 bg-red-50' : ''}
    `}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full
            ${message.variant === 'success' ? 'bg-green-100' : ''}
            ${message.variant === 'warning' ? 'bg-orange-100' : ''}
            ${message.variant === 'error' ? 'bg-red-100' : ''}
          `}>
            {verificationStatus === 'approved' || verificationStatus === 'verified' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : verificationStatus === 'pending' ? (
              <Clock className="h-8 w-8 text-orange-600" />
            ) : verificationStatus === 'rejected' ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className={`
              ${message.variant === 'success' ? 'text-green-800' : ''}
              ${message.variant === 'warning' ? 'text-orange-800' : ''}
              ${message.variant === 'error' ? 'text-red-800' : ''}
            `}>
              {message.title}
            </CardTitle>
            <div className="mt-2">
              <VerificationStatusBadge 
                status={verificationStatus} 
                size="md"
                showIcon={true}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`
          text-sm mb-4
          ${message.variant === 'success' ? 'text-green-700' : ''}
          ${message.variant === 'warning' ? 'text-orange-700' : ''}
          ${message.variant === 'error' ? 'text-red-700' : ''}
        `}>
          {message.description}
        </p>
        
        {message.showActions && message.actionHandler && (
          <div className="flex gap-2">
            <Button 
              onClick={message.actionHandler}
              className={`
                ${message.variant === 'warning' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                ${message.variant === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
              `}
            >
              <Shield className="mr-2 h-4 w-4" />
              {message.actionText}
            </Button>
            <Button 
              variant="outline" 
              onClick={refresh}
              className="border-muted"
            >
              Refresh Status
            </Button>
          </div>
        )}

        {(verificationStatus === 'approved' || verificationStatus === 'verified') && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/rent-out-your-space'}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              List Parking Space
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/find-parking'}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Find Parking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};