import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EmailConfirmed = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        
        console.log('Email confirmation parameters:', { token: !!token, email });

        if (!token || !email) {
          throw new Error('Missing confirmation token or email. Please use the link from your email.');
        }

        // Verify the confirmation token with our custom endpoint
        const { data, error: confirmError } = await supabase.functions.invoke('confirm-email', {
          body: {
            token,
            email
          }
        });

        if (confirmError) {
          console.error('Confirmation error:', confirmError);
          throw new Error(confirmError.message || 'Failed to confirm email');
        }

        if (data?.success) {
          setIsConfirmed(true);
          
          // Redirect after a short delay
          setTimeout(() => {
            const redirectTo = searchParams.get('redirectTo') || '/auth';
            navigate(redirectTo);
          }, 2000);
        } else {
          throw new Error(data?.message || 'Email confirmation failed');
        }
        
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        setError(err.message || 'Failed to confirm email. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Confirming your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Email Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your email has been successfully confirmed! You can now sign in to your account.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Sign In to Your Account
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Confirmation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {error || 'We were unable to confirm your email address.'}
            </p>
            <p className="text-sm">
              Don't worry! If you already have an account, you can sign in directly.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Sign In to Your Account
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full"
                variant="outline"
              >
                Create New Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;