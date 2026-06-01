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
          // Clean up the URL hash/query left over from the OAuth redirect
          window.history.replaceState(null, '', '/auth/callback');

          // Check if the user is an admin — admins must complete MFA before reaching /admin
          const userId = data.session.user?.id;
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
            navigate('/');
          }
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
