import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const EmailConfirmed = () => {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        console.log('=== EMAIL CONFIRMATION DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash params:', window.location.hash);
        
        // Check for error parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        if (error) {
          console.log('Error found in URL:', { error, errorDescription });
          setError(errorDescription || error);
          setLoading(false);
          return;
        }

        // Check for PKCE code (Supabase v2 with flowType 'pkce')
        const code = urlParams.get('code') || hashParams.get('code');
        // Legacy tokens (non-PKCE)
        const token = urlParams.get('token') || hashParams.get('token');
        const tokenHash = urlParams.get('token_hash') || hashParams.get('token_hash');
        const type = urlParams.get('type') || hashParams.get('type');
        
        console.log('URL tokens found:', { hasCode: !!code, token: !!token, tokenHash: !!tokenHash, type });

        // If PKCE code is present, exchange it immediately for a session
        if (code) {
          console.log('Exchanging PKCE code for session...');
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('PKCE exchange error:', exchangeError);
            setError(exchangeError.message || 'Failed to confirm email. The link may be invalid or expired.');
            setLoading(false);
            return;
          }
          console.log('PKCE exchange successful. User:', exchangeData.session?.user?.email);
          setConfirmed(true);
          setLoading(false);
          return;
        }

        // Small delay to allow Supabase to process any URL tokens
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check result:', { 
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          userEmailConfirmed: sessionData?.session?.user?.email_confirmed_at,
          error: sessionError?.message 
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Unable to confirm email - session error');
        } else if (sessionData?.session?.user) {
          console.log('Email confirmed successfully - user is authenticated');
          setConfirmed(true);
        } else {
          // If no session but we have legacy tokens, try to refresh the session
          if (token || tokenHash) {
            console.log('Attempting to refresh session with tokens...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshData?.session?.user) {
              console.log('Session refreshed successfully');
              setConfirmed(true);
            } else {
              console.log('Failed to refresh session:', refreshError);
              setError('Email confirmation failed - please try signing in directly');
            }
          } else {
            console.log('No tokens found in URL - confirmation may have already been processed');
            setError('Email confirmation link is invalid or has expired. Please request a new confirmation email.');
          }
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setError('An error occurred during email confirmation. Please try signing in directly.');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, []);

  // Auto-redirect after successful confirmation
  useEffect(() => {
    if (confirmed) {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect_to') || '/my-account';
      console.log('Redirecting to:', redirectTo);
      
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    }
  }, [confirmed, navigate]);

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