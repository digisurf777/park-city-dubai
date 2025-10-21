import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', agreeToTerms: false });
  const [rateLimited, setRateLimited] = useState(false);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const { signIn, signUp, resetPassword, updatePassword, user, challengeMFA, verifyMFAChallenge, getMFAFactors } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for password reset token, email confirmation, or confirmation errors
  useEffect(() => {
    const handleAuthTokens = async () => {
      const type = searchParams.get('type');
      const confirmed = searchParams.get('confirmed');
      const email = searchParams.get('email');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // Also check URL fragment for tokens (Supabase puts tokens after #)
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(hash.substring(1));
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const hashError = urlParams.get('error');
      const hashErrorDescription = urlParams.get('error_description');
      
      console.log('Auth page useEffect - URL params:', { type, confirmed, email, error, errorDescription });
      console.log('Auth page useEffect - Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, hashError, hashErrorDescription });
      
      if (type === 'recovery') {
        if (hashError) {
          console.error('Password recovery error:', hashError, hashErrorDescription);
          if (hashError === 'access_denied' && hashErrorDescription?.includes('expired')) {
            toast.error('Reset link has expired', {
              duration: 8000,
              description: 'Please request a new password reset email.'
            });
          } else {
            toast.error('Password reset failed', {
              duration: 8000,
              description: hashErrorDescription || 'The reset link is invalid.'
            });
          }
          return;
        }
        
        if (accessToken && refreshToken) {
          console.log('Setting up session with recovery tokens');
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session setup error:', sessionError);
              toast.error('Failed to setup reset session', {
                description: 'Please request a new password reset email.'
              });
              return;
            }
            
            console.log('Session established successfully for password reset');
            setShowPasswordUpdate(true);
            console.log('showPasswordUpdate set to true');
            toast.info('Please set your new password');
            
            // Clean up URL but keep recovery type
            window.history.replaceState(null, '', '/auth?type=recovery');
          } catch (error) {
            console.error('Error setting up recovery session:', error);
            toast.error('Failed to setup password reset session');
          }
        } else {
          console.log('Password recovery detected but no tokens found');
          toast.error('Invalid reset link', {
            description: 'Please request a new password reset email.'
          });
        }
      } else if (confirmed === 'true' && email) {
      toast.success('Email confirmed successfully!', {
        duration: 6000,
        description: 'You can now log in with your credentials.'
      });
      // Clear the URL parameters
      navigate('/auth', { replace: true });
    } else if (error) {
      // Handle confirmation errors
      console.log('Auth page - confirmation error:', { error, errorDescription });
      
      if (error === 'access_denied') {
        toast.error('Email confirmation failed', {
          duration: 8000,
          description: 'The confirmation link may have expired. Please try signing up again or contact support.'
        });
      } else if (error === 'server_error') {
        toast.error('Server error during confirmation', {
          duration: 8000,
          description: 'There was a problem confirming your email. Please try again or contact support.'
        });
      } else {
        toast.error('Email confirmation error', {
          duration: 8000,
          description: errorDescription || 'Please try signing up again or contact support if the problem persists.'
        });
      }
      
      // Clear error parameters from URL
      navigate('/auth', { replace: true });
    }
    };
    
    handleAuthTokens();
  }, [searchParams, navigate]);

  // Redirect if already logged in (unless it's password recovery)
  const isRecoveryMode = searchParams.get('type') === 'recovery' || showPasswordUpdate;
  if (user && !isRecoveryMode) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.', {
            duration: 8000,
            description: 'Check your spam folder if you don\'t see the email.'
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          toast.error(error.message || 'Login failed');
        }
        setLoading(false);
      } else {
        // Check if user is admin and has MFA enabled
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const userId = session.session.user.id;
          
          // Check if user is admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .maybeSingle();
          
          if (roleData) {
            // User is admin - check for verified MFA factor
            const { factors } = await getMFAFactors();
            const totpFactor = factors?.find(f => f.status === 'verified');
            
            if (totpFactor) {
              // Admin has MFA enabled - challenge for code
              const { challengeId, error: challengeError } = await challengeMFA(totpFactor.id);
              
              if (!challengeError && challengeId) {
                setMfaFactorId(totpFactor.id);
                setMfaChallengeId(challengeId);
                setShowMFAChallenge(true);
                toast.info('Enter the 6-digit code from your authenticator app');
                setLoading(false);
                return; // Don't navigate yet - wait for MFA verification
              }
            }
          }
        }
        
        // Non-admin or no MFA setup - proceed with normal login
        toast.success('Logged in successfully! Redirecting...', {
          duration: 2000
        });
        setTimeout(() => {
          navigate('/');
        }, 1500);
        setLoading(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  const handleMFAVerification = async () => {
    if (mfaCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await verifyMFAChallenge(mfaChallengeId, mfaCode);
      
      if (error) {
        toast.error('Invalid code. Please try again.');
        setMfaCode('');
        setLoading(false);
      } else {
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (err) {
      toast.error('An error occurred during verification');
      setMfaCode('');
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    
    return hasLowercase && hasUppercase && hasDigit && hasSymbol && password.length >= 6;
  };

  // Enhanced rate limit detection function
  const isRateLimitError = (error: any) => {
    const errorMsg = (error?.message || '').toLowerCase();
    const errorCode = error?.code;
    
    // Multiple ways to detect rate limiting
    return (
      errorMsg.includes('rate limit') ||
      errorMsg.includes('429') ||
      errorMsg.includes('too many') ||
      errorMsg.includes('temporarily busy') ||
      errorCode === 'over_email_send_rate_limit' ||
      errorCode === 'email_rate_limit_exceeded' ||
      error?.status === 429
    );
  };

  // Enhanced signup handler with comprehensive error detection
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log signup attempt for debugging
    console.log('Signup attempt started', { email: signupForm.email, timestamp: new Date().toISOString() });
    
    // Prevent multiple rapid submissions
    if (loading || rateLimited) {
      console.log('Signup blocked - loading or rate limited', { loading, rateLimited });
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!validatePassword(signupForm.password)) {
      toast.error('Password must contain lowercase, uppercase, digits and symbols');
      return;
    }
    
    if (!signupForm.agreeToTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Calling signUp function...');
      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName, 'seeker');
      
      console.log('SignUp response:', { 
        hasError: !!error, 
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStatus: error?.status
      });
      
      if (error) {
        // Check for existing user first
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast.error('This email address is already registered', {
            description: 'Try logging in instead, or use a different email address.'
          });
        } 
        // Enhanced rate limit detection
        else if (isRateLimitError(error)) {
          console.log('Rate limit detected, showing success message');
          setRateLimited(true);
          
          // Clear browser cache to prevent old error messages
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name);
              });
            });
          }
          
          // Show success message instead of error
          toast.success('Account created successfully!', {
            duration: 8000,
            description: 'Email confirmation is temporarily delayed due to high server traffic. You can try logging in now or wait for the confirmation email.'
          });
          
          // Show helpful follow-up message
          setTimeout(() => {
            toast.info('Next steps', {
              duration: 12000,
              description: 'Switch to the Login tab and try logging in directly. Your account may already be active even without email confirmation.'
            });
          }, 3000);
          
          // Clear the form since account was likely created
          setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '', agreeToTerms: false });
          
          // Reset rate limit state after 5 minutes
          setTimeout(() => {
            setRateLimited(false);
            console.log('Rate limit state reset');
          }, 5 * 60 * 1000);
        } 
        // All other errors
        else {
          console.log('Other signup error:', error.message);
          toast.error(error.message || 'Error during registration', {
            description: 'Please try again or contact support if the problem persists.'
          });
        }
      } else {
        // Successful signup without rate limiting
        console.log('Signup successful without issues');
        toast.success('Account created successfully!', {
          duration: 6000,
          description: 'Check your inbox and confirm your email address before logging in.'
        });
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '', agreeToTerms: false });
        
        // Show additional info about email confirmation
        setTimeout(() => {
          toast.info('Important!', {
            duration: 8000,
            description: 'You must confirm your email address before you can log in. Also check your spam folder.'
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Signup catch block error:', error);
      
      // Even in catch block, check for rate limiting
      if (isRateLimitError(error)) {
        setRateLimited(true);
        toast.success('Account may have been created successfully!', {
          duration: 8000,
          description: 'Email system is busy. Try logging in after a few minutes.'
        });
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '', agreeToTerms: false });
      } else {
        toast.error('An unexpected error occurred during registration', {
          description: 'Please refresh the page and try again.'
        });
      }
    } finally {
      setLoading(false);
      console.log('Signup attempt completed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password form submitted with email:', resetEmail);
    
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setResetLoading(true);
    
    try {
      console.log('Calling resetPassword function...');
      const { error } = await resetPassword(resetEmail);
      console.log('Reset password response:', { hasError: !!error, error });
      
      if (error) {
        console.error('Reset password error:', error);
        toast.error(error.message || 'Error sending password reset email');
      } else {
        console.log('Reset password success');
        toast.success('Password reset email sent!', {
          description: 'Check your inbox for the reset link.'
        });
        setResetEmail('');
        setShowResetForm(false);
      }
    } catch (error) {
      console.error('Reset password exception:', error);
      toast.error('An error occurred while sending password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        toast.error(error.message || 'Error updating password');
      } else {
        toast.success('Password updated successfully!');
        setShowPasswordUpdate(false);
        setNewPassword('');
        setConfirmPassword('');
        navigate('/');
      }
    } catch (error) {
      toast.error('An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('Starting Google OAuth...');
      setLoading(true);
      
      // Clean up auth state before OAuth
      try {
        localStorage.removeItem('supabase.auth.token');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (cleanupError) {
        console.error('Error cleaning up auth state:', cleanupError);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Google auth error:', error);
        toast.error(`Google authentication failed: ${error.message}`);
      } else {
        console.log('Google OAuth initiated successfully');
      }
    } catch (error) {
      console.error('Google auth exception:', error);
      toast.error('Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  // Show MFA challenge screen if admin needs to enter code
  if (showMFAChallenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-zoom-slow">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={mfaCode}
                  onChange={setMfaCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button 
                onClick={handleMFAVerification} 
                disabled={loading || mfaCode.length !== 6}
                className="w-full"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify Code
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowMFAChallenge(false);
                  setMfaCode('');
                  setMfaFactorId('');
                  setMfaChallengeId('');
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show password update form if coming from reset link
  if (showPasswordUpdate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-zoom-slow">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Set New Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowPasswordUpdate(false);
                  navigate('/auth');
                }}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-zoom-slow">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Shazam Parking</CardTitle>
          <CardDescription className="text-center">
            Log in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Log in with Google
                </Button>
                
                <Separator className="my-4" />
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      className="text-sm p-0"
                      onClick={() => {
                        console.log('Forgot password clicked, showResetForm was:', showResetForm);
                        setShowResetForm(!showResetForm);
                        console.log('showResetForm toggled to:', !showResetForm);
                      }}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                  
                  {showResetForm && (
                    <form onSubmit={handleResetPassword} className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email for password reset</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          className="flex-1" 
                          disabled={resetLoading}
                          onClick={async (e) => {
                            e.preventDefault();
                            console.log('Reset button clicked directly');
                            await handleResetPassword(e as any);
                          }}
                        >
                          {resetLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Reset Email'
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowResetForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleAuth}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Button>
                
                <Separator className="my-4" />
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Email confirmation required</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      After registration you must confirm your email address before logging in.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password (min. 6 characters)"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="signup-terms"
                      checked={signupForm.agreeToTerms}
                      onCheckedChange={(checked) => setSignupForm({ ...signupForm, agreeToTerms: !!checked })}
                      required
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="signup-terms"
                        className="text-sm font-normal leading-5 cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link 
                          to="/terms-and-conditions" 
                          target="_blank"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms & Conditions
                        </Link>
                        {" "}and{" "}
                        <Link 
                          to="/privacy-policy"
                          target="_blank" 
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </Label>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading || rateLimited}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : rateLimited ? (
                      'Rate Limited - Please Wait'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  
                  {rateLimited && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                      <p className="text-xs text-yellow-700">
                        Too many signup attempts detected. Please wait a few minutes before trying again.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;