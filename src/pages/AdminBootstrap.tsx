import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AdminBootstrap = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const createAdmin = async () => {
      try {
        setStatus('loading');
        setMessage('Setting up admin account...');

        const { data, error } = await supabase.functions.invoke('create-or-update-admin', {
          body: {
            email: 'anwerhammad479@gmail.com',
            password: 'admin123'
          }
        });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage(data.message);
        setDetails(data);
      } catch (error: any) {
        console.error('Error setting up admin:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to setup admin account');
      }
    };

    createAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            Admin Bootstrap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{message}</p>
          
          {details && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm"><strong>Email:</strong> {details.email}</p>
              <p className="text-sm"><strong>User ID:</strong> {details.userId}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Admin account is ready! You can now sign in with:
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm"><strong>Email:</strong> anwerhammad479@gmail.com</p>
                <p className="text-sm"><strong>Password:</strong> admin123</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/auth">Go to Login</Link>
            </Button>
            {status === 'success' && (
              <Button asChild variant="outline" className="flex-1">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </div>

          {status === 'error' && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBootstrap;