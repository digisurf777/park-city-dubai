import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();

  console.log('OAuthCallback: Component mounted - route is working!');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('OAuthCallback: Processing OAuth callback...');

      try {
        // Surface any explicit OAuth error returned by Google/Supabase (query or hash)
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const oauthError =
          queryParams.get('error_description') ||
          queryParams.get('error') ||
          hashParams.get('error_description') ||
          hashParams.get('error');

        if (oauthError) {
          console.error('OAuthCallback: OAuth provider returned an error:', oauthError);
          toast.error(`Google sign-in failed: ${oauthError}`);
          navigate('/auth');
          return;
        }

        // If we got a PKCE authorization code, exchange it for a session explicitly.
        const code = queryParams.get('code');
        const next = queryParams.get('next') || '/my-account';
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('OAuthCallback: Code exchange failed:', exchangeError);
            toast.error(`Google sign-in failed: ${exchangeError.message}`);
            navigate('/auth');
            return;
          }
        }

        // Wait briefly for the session to be persisted (handles detectSessionInUrl timing)
        const waitForSession = async (maxMs = 5000) => {
          const start = Date.now();
          while (Date.now() - start < maxMs) {
            const { data } = await supabase.auth.getSession();
            if (data.session) return data.session;
            await new Promise((r) => setTimeout(r, 200));
          }
          return null;
        };

        const session = await waitForSession();

        if (session) {
          console.log('OAuthCallback: OAuth session established successfully');
          toast.success('Successfully signed in with Google!');
          // Clean up the URL left over from the OAuth redirect
          window.history.replaceState(null, '', '/auth/callback');

          // Check if the user is an admin — admins must complete MFA before reaching /admin
          const userId = session.user?.id;
          let isAdmin = false;
          if (userId) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId)
              .eq('role', 'admin')
              .maybeSingle();
            isAdmin = !!roleData;
          }

          if (isAdmin) {
            // Send admins to /auth, which detects admin + AAL1 and triggers the MFA challenge
            console.log('OAuthCallback: Admin user detected, routing to MFA challenge');
            navigate('/auth');
          } else {
            // Regular users land on their account page
            navigate(next.startsWith('/') ? next : '/my-account');
          }
        } else {
          console.log('OAuthCallback: No session found, redirecting to auth');
          toast.error('Could not complete sign in. Please try again.');
          navigate('/auth');
        }
      } catch (error) {
        console.error('OAuthCallback: Exception during callback processing:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    // Small delay to ensure URL parameters are processed
    const timer = setTimeout(handleOAuthCallback, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
