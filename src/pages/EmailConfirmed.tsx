useEffect(() => {
  const confirmEmail = async () => {
    try {
      console.log('=== EMAIL CONFIRMATION DEBUG ===');
      console.log('Full URL:', window.location.href);
      console.log('Search params:', window.location.search);
      console.log('Hash params:', window.location.hash);
      
      // Parse URL parameters from both query string and hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for error parameters first
      const error = urlParams.get('error') || hashParams.get('error');
      const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
      
      if (error) {
        console.log('Error found in URL:', { error, errorDescription });
        setError(errorDescription || error);
        setLoading(false);
        return;
      }

      // Check for various token formats that Supabase might use
      const token = urlParams.get('token') || hashParams.get('token');
      const tokenHash = urlParams.get('token_hash') || hashParams.get('token_hash');
      const type = urlParams.get('type') || hashParams.get('type');
      const code = urlParams.get('code') || hashParams.get('code'); // Handle 'code' parameter
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      
      console.log('URL tokens found:', { 
        token: !!token, 
        tokenHash: !!tokenHash, 
        code: !!code,
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        type 
      });

      // Try different confirmation approaches based on available parameters
      let confirmationAttempted = false;

      // Method 1: If we have token_hash, try verifyOtp
      if (tokenHash && type) {
        console.log('Attempting confirmation with token_hash and type...');
        confirmationAttempted = true;
        
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        });

        if (verifyError) {
          console.error('Token hash verification failed:', verifyError);
        } else if (data?.user) {
          console.log('Email confirmed successfully with token_hash');
          setConfirmed(true);
          setLoading(false);
          return;
        }
      }

      // Method 2: If we have a 'code' parameter, try exchangeCodeForSession
      if (code && !confirmationAttempted) {
        console.log('Attempting confirmation with code parameter...');
        confirmationAttempted = true;
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Code exchange failed:', exchangeError);
        } else if (data?.user) {
          console.log('Email confirmed successfully with code exchange');
          setConfirmed(true);
          setLoading(false);
          return;
        }
      }

      // Method 3: If we have access_token and refresh_token, set the session directly
      if (accessToken && refreshToken && !confirmationAttempted) {
        console.log('Attempting to set session with tokens...');
        confirmationAttempted = true;
        
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session setting failed:', sessionError);
        } else if (data?.user) {
          console.log('Email confirmed successfully with session tokens');
          setConfirmed(true);
          setLoading(false);
          return;
        }
      }

      // Method 4: Check current session (might already be authenticated)
      console.log('Checking current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Unable to verify email confirmation status');
      } else if (sessionData?.session?.user) {
        console.log('User is already authenticated - email confirmation successful');
        setConfirmed(true);
      } else {
        // Method 5: Final attempt - try to refresh session if we have any tokens
        if ((token || tokenHash || code) && !confirmationAttempted) {
          console.log('Final attempt: refreshing session...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshData?.session?.user) {
            console.log('Session refreshed successfully');
            setConfirmed(true);
          } else {
            console.log('All confirmation methods failed:', refreshError);
            setError('Email confirmation link is invalid or has expired. Please request a new confirmation email or try signing in directly.');
          }
        } else {
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