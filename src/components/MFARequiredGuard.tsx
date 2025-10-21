import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { MFASetup } from './MFASetup';
import { supabase } from '@/integrations/supabase/client';

export const MFARequiredGuard = ({ children }: { children: React.ReactNode }) => {
  const { mfaRequired, mfaEnabled, user, loading } = useAuth();
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

  // Only show MFA setup if user is admin and doesn't have MFA enabled
  useEffect(() => {
    if (!loading && !checkingRole && user && isAdmin && mfaRequired && !mfaEnabled) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [mfaRequired, mfaEnabled, user, loading, isAdmin, checkingRole]);

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
            <AlertTitle>Two-Factor Authentication Required</AlertTitle>
            <AlertDescription>
              As an administrator, you must enable two-factor authentication before accessing admin features.
              This is a security requirement to protect sensitive data.
            </AlertDescription>
          </Alert>
          
          <MFASetup />
          
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
