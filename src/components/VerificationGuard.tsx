import { useVerificationGuard } from '@/hooks/useVerificationGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationGuardProps {
  children: React.ReactNode;
  feature: string;
}

export const VerificationGuard = ({ children, feature }: VerificationGuardProps) => {
  const { canAccessFeatures, message } = useVerificationGuard();
  const navigate = useNavigate();

  if (!canAccessFeatures) {
    return (
      <div className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            <div className="space-y-3">
              <p><strong>Verification Required</strong></p>
              <p>{message}</p>
              <Button 
                onClick={() => navigate('/my-account')}
                variant="outline"
                size="sm"
                className="bg-white text-black border-2 border-gray-300 hover:bg-gray-50 font-semibold"
              >
                <Shield className="h-4 w-4 mr-2" />
                Complete Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};