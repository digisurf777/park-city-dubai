
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
  const [countdown, setCountdown] = useState(3);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setError('Invalid confirmation link');
          setLoading(false);
          return;
        }

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Verification error:', error);
          setError('The confirmation link has expired or is invalid');
        } else if (data.user) {
          setConfirmed(true);
          
          // Update the profile to mark email as confirmed
          try {
            await supabase
              .from('profiles')
              .update({ email_confirmed_at: new Date().toISOString() })
              .eq('user_id', data.user.id);
          } catch (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't fail confirmation if profile update fails
          }

          // Start countdown and auto-redirect
          let counter = 3;
          setCountdown(counter);
          const timer = setInterval(() => {
            counter--;
            setCountdown(counter);
            if (counter === 0) {
              clearInterval(timer);
              navigate('/auth');
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setError('An error occurred while confirming your email address');
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
            <p>Confirming your email address...</p>
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
                Your email address has been confirmed. You can now sign in to your account.
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Go to Sign In Now
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-red-600">
                {error || "The confirmation link is invalid or has expired."}
              </p>
              <p className="text-sm text-muted-foreground">
                Try registering again or contact support if the problem persists.
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
