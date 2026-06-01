import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle } from 'lucide-react';
import { MFASetup } from './MFASetup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MFARequiredGuard = ({ children }: { children: React.ReactNode }) => {
  const { mfaRequired, mfaEnabled, user, loading, signOut, challengeMFA, verifyMFAChallenge, getMFAFactors } = useAuth();
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingRole(false);
        return;
      }

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  // Server-side validation for admins using edge function (avoids relying on client AAL)
  useEffect(() => {
    const validateSecureAccess = async () => {
      if (!user || !isAdmin || loading || checkingRole) {
        setShowSetup(false);
        setShowMFAChallenge(false);
        return;
      }
      
      try {
        // Quick check: if client session already shows AAL2, skip expensive validation
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const clientAAL = aalData?.currentLevel;
        
        if (clientAAL === 'aal2') {
          console.log('MFARequiredGuard: Session already at AAL2, allowing access');
          setShowSetup(false);
          setShowMFAChallenge(false);
          return;
        }

        // If MFA is enabled but session is AAL1, trigger MFA challenge
        if (mfaEnabled && clientAAL === 'aal1') {
          console.log('MFARequiredGuard: MFA enabled but session is AAL1, triggering challenge');
          const { factors } = await getMFAFactors();
          const totpFactor = factors.find((f: any) => f.factor_type === 'totp' && f.status === 'verified');
          
          if (totpFactor) {
            const { challengeId: newChallengeId, error: challengeError } = await challengeMFA(totpFactor.id);
            if (!challengeError && newChallengeId) {
              setChallengeId(newChallengeId);
              setShowMFAChallenge(true);
              setShowSetup(false);
              return;
            }
          }
        }

        // If MFA is not enabled, show setup
        if (!mfaEnabled) {
          setShowSetup(true);
          setShowMFAChallenge(false);
        }
      } catch (error) {
        console.error('MFARequiredGuard validation error:', error);
        // On error, check if MFA needs to be set up
        if (!mfaEnabled) {
          setShowSetup(true);
        }
        setShowMFAChallenge(false);
      }
    };
    validateSecureAccess();
  }, [user, loading, isAdmin, checkingRole, mfaEnabled]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not admin, allow access without MFA
  if (!isAdmin) {
    return <>{children}</>;
  }

  // Handle MFA verification for existing users
  const handleMFAVerify = async () => {
    if (!mfaCode.trim() || !challengeId) {
      toast.error('Please enter your authentication code');
      return;
    }

    setVerifying(true);
    try {
      const { error } = await verifyMFAChallenge(challengeId, mfaCode);
      
      if (error) {
        toast.error('Invalid authentication code. Please try again.');
        setMfaCode('');
        return;
      }

      toast.success('Authentication successful');
      setShowMFAChallenge(false);
      setMfaCode('');
      
      // Force a re-validation after successful MFA
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('MFA verification error:', error);
      toast.error('Failed to verify authentication code');
    } finally {
      setVerifying(false);
    }
  };

  if (showMFAChallenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Two-Factor Authentication Required</AlertTitle>
            <AlertDescription>
              Please enter the 6-digit code from your authenticator app to continue.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4 bg-card p-6 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Authentication Code</Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleMFAVerify();
                  }
                }}
                autoFocus
                disabled={verifying}
              />
            </div>
            
            <Button 
              onClick={handleMFAVerify}
              disabled={verifying || mfaCode.length !== 6}
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Multi-Factor Authentication Required</AlertTitle>
            <AlertDescription>
              {mfaEnabled 
                ? 'Your session requires MFA verification. Please log out and log back in with your authenticator code.'
                : 'As an administrator, you must enable two-factor authentication before accessing admin features. This is a security requirement to protect sensitive data.'
              }
            </AlertDescription>
          </Alert>
          
          {mfaEnabled ? (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-sm text-muted-foreground text-center">
                You have MFA enabled but your current session is not verified. Please log out and log in again.
              </p>
              <Button 
                onClick={async () => {
                  await signOut();
                  navigate('/auth');
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Log Out and Re-authenticate
              </Button>
            </div>
          ) : (
            <MFASetup />
          )}
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
