import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('OAuthCallback: Processing OAuth callback...');
      
      try {
        // Let Supabase handle the OAuth callback automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuthCallback: Error getting session:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        if (data.session) {
          console.log('OAuthCallback: OAuth session established successfully');
          toast.success('Successfully signed in with Google!');
          // Clean up URL and redirect to home
          window.history.replaceState(null, '', '/');
          navigate('/');
        } else {
          console.log('OAuthCallback: No session found, redirecting to auth');
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
