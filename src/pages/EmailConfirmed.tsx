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
        setLoading(true);
        
        // Get redirect destination from URL or default to home
        const redirectTo = searchParams.get('redirect_to') || '/';
        
        // Log the full URL for debugging
        console.log('=== EMAIL CONFIRMATION DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // Handle email confirmation by checking the URL hash and query params
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        // Get tokens from both URL params and hash
        const access_token = searchParams.get('access_token') || hashParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token') || hashParams.get('refresh_token');
        const token_hash = searchParams.get('token_hash') || hashParams.get('token_hash');
        const type = searchParams.get('type') || hashParams.get('type');
        const error_code = searchParams.get('error_code') || hashParams.get('error_code');
        const error_description = searchParams.get('error_description') || hashParams.get('error_description');

        console.log('Parsed parameters:', {
          access_token: access_token ? 'present' : 'missing',
          refresh_token: refresh_token ? 'present' : 'missing', 
          token_hash: token_hash ? 'present' : 'missing',
          type,
          error_code,
          error_description,
          redirectTo
        });

        // Check for URL errors first
        if (error_code || error_description) {
          console.error('URL contains error:', { error_code, error_description });
          setError(`Email confirmation failed: ${error_description || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        // Method 1: If we have access and refresh tokens, set the session directly
        if (access_token && refresh_token) {
          console.log('Attempting setSession with tokens...');
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });

            console.log('SetSession result:', { 
              success: !error, 
              hasUser: !!data.session?.user,
              emailConfirmed: !!data.session?.user?.email_confirmed_at,
              error: error?.message 
            });

            if (!error && data.session?.user) {
              console.log('✅ Email confirmation successful via setSession');
              setConfirmed(true);
              toast.success('Email confirmed successfully! Redirecting...');
              setTimeout(() => {
                navigate(redirectTo);
              }, 1500);
              return;
            } else {
              console.error('❌ SetSession failed:', error);
            }
          } catch (err) {
            console.error('❌ SetSession exception:', err);
          }
        }

        // Method 2: If we have a token hash, exchange it for a session
        if (token_hash && (type === 'email' || type === 'signup')) {
          console.log('Attempting exchangeCodeForSession with token_hash...');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash);

            console.log('ExchangeCode result:', { 
              success: !error, 
              hasUser: !!data.session?.user,
              emailConfirmed: !!data.session?.user?.email_confirmed_at,
              error: error?.message 
            });

            if (!error && data.session?.user) {
              console.log('✅ Email confirmation successful via exchangeCodeForSession');
              setConfirmed(true);
              toast.success('Email confirmed successfully! Redirecting...');
              setTimeout(() => {
                navigate(redirectTo);
              }, 1500);
              return;
            } else {
              console.error('❌ Code exchange failed:', error);
            }
          } catch (err) {
            console.error('❌ Code exchange exception:', err);
          }
        }

        // Method 3: Check if user is already authenticated (fallback)
        console.log('Checking existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Current session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          emailConfirmed: !!session?.user?.email_confirmed_at,
          error: sessionError?.message
        });
        
        if (session?.user?.email_confirmed_at && !sessionError) {
          console.log('✅ User already confirmed and logged in');
          setConfirmed(true);
          toast.success('Welcome! You are already verified and logged in.');
          setTimeout(() => {
            navigate(redirectTo);
          }, 1500);
          return;
        }

        // If all methods fail, provide detailed error
        console.log('❌ All confirmation methods failed');
        if (!access_token && !refresh_token && !token_hash) {
          setError('No confirmation tokens found in the URL. The link may be incomplete or corrupted.');
        } else {
          setError('Your confirmation link has expired or is invalid. Please try signing in to your account.');
        }
        
      } catch (err) {
        console.error('❌ Email confirmation exception:', err);
        setError('An unexpected error occurred during email confirmation. Please try signing in to your account.');
      } finally {
        setLoading(false);
      }
    };

    const handleExpiredLink = () => {
      setError('Your confirmation link has expired or is invalid. Please sign in to your account or register again if you need a new confirmation email.');
    };

    confirmEmail();
  }, [searchParams, navigate]);

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
          <div className="space-y-4">
            <p className="text-sm text-center">
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