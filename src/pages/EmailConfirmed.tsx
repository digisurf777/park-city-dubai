
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
        // Get all possible URL parameters that Supabase might send
        const tokenHash = searchParams.get('token_hash');
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        // Log all parameters for debugging
        console.log('All URL params:', Object.fromEntries(searchParams.entries()));
        console.log('Confirmation params:', { tokenHash, token, type, redirectTo, accessToken, refreshToken });

        // If we have access and refresh tokens, try setting the session directly
        if (accessToken && refreshToken) {
          console.log('Found access and refresh tokens, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Session setting error:', error);
            setError(error.message || 'Failed to confirm email with provided tokens');
          } else if (data.user) {
            setConfirmed(true);
            
            // Update profile
            try {
              await supabase
                .from('profiles')
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq('user_id', data.user.id);
            } catch (profileError) {
              console.error('Error updating profile:', profileError);
            }

            // Start countdown and redirect
            let counter = 3;
            setCountdown(counter);
            const timer = setInterval(() => {
              counter--;
              setCountdown(counter);
              if (counter === 0) {
                clearInterval(timer);
                navigate('/my-account');
              }
            }, 1000);
          }
          setLoading(false);
          return;
        }

        // Fallback to OTP verification if no session tokens
        if (!tokenHash && !token) {
          console.error('No token found in URL');
          setError('Invalid confirmation link - no token or session data found');
          setLoading(false);
          return;
        }

        // Default type to 'signup' if not provided
        const confirmationType = type || 'signup';

        // Try to verify with token_hash first (preferred method)
        let verificationData;
        
        if (tokenHash) {
          console.log('Verifying with token_hash...');
          verificationData = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: confirmationType as any
          });
        } else {
          // For simple token verification, we need more specific handling
          console.log('Token verification not supported in this flow');
          setError('Unsupported confirmation link format');
          setLoading(false);
          return;
        }

        const { data, error } = verificationData;

        if (error) {
          console.error('Verification error:', error);
          setError(error.message || 'The confirmation link has expired or is invalid');
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

          // Start countdown and auto-redirect to account
          let counter = 3;
          setCountdown(counter);
          const timer = setInterval(() => {
            counter--;
            setCountdown(counter);
            if (counter === 0) {
              clearInterval(timer);
              // Redirect to account page instead of auth
              navigate('/my-account');
            }
          }, 1000);
        } else {
          setError('No user data received from confirmation');
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        setError('An error occurred while confirming your email address');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleAccountRedirect = () => {
    navigate('/my-account');
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
                Your email address has been confirmed. You can now access your account.
              </p>
              <p className="text-sm text-blue-600 font-medium">
                Redirecting to your account in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <Button onClick={handleAccountRedirect} className="w-full">
                Go to My Account Now
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
