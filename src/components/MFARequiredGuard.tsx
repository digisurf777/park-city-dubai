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

  // Server-side validation for admins using edge function (avoids relying on client AAL)
  useEffect(() => {
    const validateSecureAccess = async () => {
      if (!user || !isAdmin || loading || checkingRole) {
        setShowSetup(false);
        return;
      }
      try {
        const waitForAAL2 = async (maxMs: number = 6000) => {
          const start = Date.now();
          while (Date.now() - start < maxMs) {
            const { data: s } = await supabase.auth.getSession();
            const aal = (s.session as any)?.aal;
            if (aal === 'aal2') return true;
            await new Promise((r) => setTimeout(r, 300));
          }
          return false;
        };

        // Ensure token reflects MFA upgrade
        const upgraded = await waitForAAL2();

        const { data: sessionData } = await supabase.auth.getSession();
        const clientAAL = (sessionData.session as any)?.aal;

        // Proactively refresh to propagate AAL2 into the access token
        try {
          await supabase.auth.refreshSession();
        } catch (e) {
          console.warn('MFARequiredGuard: refreshSession failed (continuing)', e);
        }

        const invokeValidate = async () => {
          const { data, error } = await supabase.functions.invoke('validate-admin-access');
          return { data, error } as { data: any; error: any };
        };
        let res = await invokeValidate();
        if (res.error || res.data?.requires_mfa) {
          await new Promise((r) => setTimeout(r, 600));
          res = await invokeValidate();
        }

        if (!res.error && !res.data?.requires_mfa) {
          setShowSetup(false);
          return;
        }

        // Final fallback: if client shows AAL2, allow render; AdminPanel will re-validate strictly
        if (clientAAL === 'aal2' || upgraded) {
          console.warn('MFARequiredGuard: Allowing access on client AAL2; AdminPanel will enforce server validation.');
          setShowSetup(false);
          return;
        }

        setShowSetup(true);
      } catch (error) {
        console.error('MFARequiredGuard secure validation error:', error);
        setShowSetup(true);
      }
    };
    validateSecureAccess();
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
