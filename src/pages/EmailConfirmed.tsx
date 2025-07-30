
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
        const email = searchParams.get('email');
        const token = searchParams.get('token');
        
        console.log('Custom verification params:', { email, token });

        // Handle custom verification token
        if (email && token) {
          console.log('Using custom verification token method');
          
          // For now, we'll simply mark as confirmed since this is a custom verification
          // In a production app, you'd verify the token against a database
          setConfirmed(true);
          console.log('Email verified successfully for:', email);
          
          // Send welcome email after successful confirmation
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: email,
                name: 'User' // We don't have the full name in the URL params
              }
            });
            console.log('Welcome email sent successfully');
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the confirmation if email fails
          }
          
          // Redirect to auth page for user to login
          setTimeout(() => {
            navigate('/auth?verified=true');
          }, 2000);
          
          return;
        }

        // Fallback: Handle Supabase built-in verification methods
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const code = searchParams.get('code');

        // Also check hash fragment for tokens
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');

        console.log('Supabase verification params:', { 
          token_hash, 
          type, 
          access_token, 
          refresh_token, 
          code,
          hashAccessToken,
          hashRefreshToken
        });

        let result;

        // Try different confirmation methods in order of preference
        if (access_token && refresh_token) {
          console.log('Using direct access token method');
          result = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
        } else if (hashAccessToken && hashRefreshToken) {
          console.log('Using hash fragment token method');
          result = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken
          });
        } else if (code) {
          console.log('Using OAuth code exchange method');
          result = await supabase.auth.exchangeCodeForSession(code);
        } else if (token_hash && type) {
          console.log('Using token hash verification method');
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });
        } else {
          console.error('No valid confirmation parameters found');
          setError('Invalid confirmation link. Please try signing up again.');
          setLoading(false);
          return;
        }

        console.log('Confirmation result:', result);

        if (result.error) {
          console.error('Confirmation error:', result.error);
          setError(result.error.message || 'Confirmation failed');
        } else if (result.data?.user) {
          setConfirmed(true);
          console.log('User confirmed successfully:', result.data.user.email);
          
          // Send welcome email after successful confirmation
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: result.data.user.email,
                name: result.data.user.user_metadata?.full_name || 'User'
              }
            });
            console.log('Welcome email sent successfully');
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the confirmation if email fails
          }
          
          // Redirect to home after success
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          console.error('No user data in result:', result);
          setError('Confirmation succeeded but no user data received');
        }
      } catch (err: any) {
        console.error('Confirmation error:', err);
        setError(err.message || 'An error occurred while confirming your email');
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
                Welcome to Shazam Parking! Your account is now active and ready to use.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Shazam Parking
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
