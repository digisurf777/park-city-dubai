import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EmailConfirmed = () => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get tokens from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        // Check URL hash for additional parameters
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashTokenHash = hashParams.get('token_hash');
        const hashType = hashParams.get('type');

        console.log('Confirmation parameters:', {
          token_hash: token_hash || hashTokenHash,
          type: type || hashType,
          access_token: access_token || hashAccessToken,
          refresh_token: refresh_token || hashRefreshToken
        });

        // Try to set session if we have tokens
        if ((access_token && refresh_token) || (hashAccessToken && hashRefreshToken)) {
          const { error } = await supabase.auth.setSession({
            access_token: access_token || hashAccessToken!,
            refresh_token: refresh_token || hashRefreshToken!
          });

          if (error) {
            console.error('Session error:', error);
            setError(error.message);
          } else {
            setConfirmed(true);
            toast.success('Email confirmed successfully!');
            // Send welcome email after successful confirmation
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: { email: (await supabase.auth.getUser()).data.user?.email }
              });
            } catch (emailError) {
              console.log('Welcome email failed:', emailError);
              // Don't show error to user for welcome email failure
            }
          }
        } 
        // Try to exchange code for session if we have token_hash
        else if ((token_hash && type) || (hashTokenHash && hashType)) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            token_hash || hashTokenHash!
          );

          if (error) {
            console.error('Code exchange error:', error);
            setError(error.message);
          } else {
            setConfirmed(true);
            toast.success('Email confirmed successfully!');
            // Send welcome email after successful confirmation
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: { email: (await supabase.auth.getUser()).data.user?.email }
              });
            } catch (emailError) {
              console.log('Welcome email failed:', emailError);
              // Don't show error to user for welcome email failure
            }
          }
        }
        // Try OTP verification as fallback
        else {
          const token = searchParams.get('token') || hashParams.get('token');
          const email = searchParams.get('email') || hashParams.get('email');
          
          if (token && email) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'email',
              email: email
            });

            if (error) {
              console.error('OTP verification error:', error);
              setError(error.message);
            } else {
              setConfirmed(true);
              toast.success('Email confirmed successfully!');
              // Send welcome email after successful confirmation
              try {
                await supabase.functions.invoke('send-welcome-email', {
                  body: { email: email }
                });
              } catch (emailError) {
                console.log('Welcome email failed:', emailError);
                // Don't show error to user for welcome email failure
              }
            }
          } else {
            setError('Invalid confirmation link. Please try registering again.');
          }
        }
      } catch (err) {
        console.error('Email confirmation error:', err);
        setError('Failed to confirm email. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();

    // Auto-redirect to home after successful confirmation
    if (confirmed) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate, confirmed]);

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  if (loading) {
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

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Email Confirmed!
            </CardTitle>
            <CardDescription className="text-center">
              Your email has been successfully confirmed. You can now log in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Homepage
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
          <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Confirmation Failed
          </CardTitle>
          <CardDescription className="text-center">
            {error || 'We were unable to confirm your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This could be because:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• The confirmation link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a technical issue</li>
          </ul>
          <Button
            onClick={handleLoginRedirect}
            className="w-full"
            variant="outline"
          >
            Back to Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;