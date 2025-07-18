
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmed = () => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        console.log('URL params:', { token_hash, type, access_token });

        // Handle different confirmation methods
        if (access_token && refresh_token) {
          // Direct token method - set the session
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            console.error('Session error:', error);
            setError('Invalid confirmation link');
          } else if (data.user) {
            setConfirmed(true);
            console.log('User confirmed via session:', data.user.email);
          }
        } else if (token_hash && type) {
          // Hash token method
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });

          if (error) {
            console.error('Verification error:', error);
            setError('Confirmation link expired or invalid');
          } else if (data.user) {
            setConfirmed(true);
            console.log('User confirmed via OTP:', data.user.email);
          }
        } else {
          setError('Invalid confirmation link - missing parameters');
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setError('An error occurred while confirming your email');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Confirming email address...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {confirmed ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                Email Confirmed!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                Confirmation Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {confirmed 
              ? "Your email address has been successfully confirmed."
              : "There was a problem confirming your email address."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {confirmed ? (
            <>
              <p className="text-sm text-muted-foreground">
                Your email has been confirmed. You can now log in to your account.
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Go to Login
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600">
                {error || "The confirmation link is invalid or expired."}
              </p>
              <p className="text-sm text-muted-foreground">
                Please try registering again or contact support if this problem persists.
              </p>
              <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                Back to Registration
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
