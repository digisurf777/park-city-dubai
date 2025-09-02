import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, CheckCircle } from 'lucide-react';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  const setupAdmin = async () => {
    if (!user) {
      toast.error('You must be logged in to setup admin privileges');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('setup_admin_for_authenticated_user');
      
      if (error) {
        console.error('Admin setup error:', error);
        toast.error('Failed to setup admin privileges: ' + error.message);
      } else {
        console.log('Admin setup result:', data);
        setIsAdmin(true);
        toast.success('Admin privileges granted successfully!', {
          description: 'You now have admin access to the system.'
        });
      }
    } catch (error) {
      console.error('Admin setup exception:', error);
      toast.error('An error occurred while setting up admin privileges');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Setup</CardTitle>
            <CardDescription className="text-center">
              You must be logged in to access admin setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {isAdmin ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                Admin Setup Complete
              </>
            ) : (
              <>
                <Shield className="h-6 w-6" />
                Admin Setup
              </>
            )}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdmin ? (
              'You now have admin privileges for this system.'
            ) : (
              'Grant admin privileges to your current account'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin ? (
            <>
              <div className="text-sm text-muted-foreground text-center">
                <p>Logged in as: <strong>{user.email}</strong></p>
                <p className="mt-2">Click below to grant admin privileges to this account.</p>
              </div>
              
              <Button 
                onClick={setupAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up admin...' : 'Grant Admin Privileges'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-center text-green-600">
                <p>✅ Admin privileges have been successfully granted!</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  className="w-full"
                >
                  Go to Admin Panel
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;