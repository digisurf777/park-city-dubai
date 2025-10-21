import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { MFASetup } from './MFASetup';
import { supabase } from '@/integrations/supabase/client';

export const MFARequiredGuard = ({ children }: { children: React.ReactNode }) => {
  const { mfaRequired, mfaEnabled, user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
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

  // Check AAL level for admins
  useEffect(() => {
    const checkAALLevel = async () => {
      if (!user || !isAdmin || loading || checkingRole) {
        setShowSetup(false);
        return;
      }
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentAAL = (sessionData.session as any)?.aal;
        
        console.log('MFARequiredGuard - AAL check:', currentAAL, 'for user:', user.id);
        
        // Admin must have AAL2 (MFA verified)
        if (currentAAL !== 'aal2') {
          console.warn('Admin access blocked: AAL2 required, current:', currentAAL);
          setShowSetup(true);
        } else {
          setShowSetup(false);
        }
      } catch (error) {
        console.error('Error checking AAL level:', error);
        setShowSetup(true);
      }
    };
    
    checkAALLevel();
  }, [user, loading, isAdmin, checkingRole]);

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
