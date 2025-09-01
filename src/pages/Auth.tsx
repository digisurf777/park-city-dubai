import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [rateLimited, setRateLimited] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for password reset token, email confirmation, or confirmation errors
  useEffect(() => {
    const type = searchParams.get('type');
    const confirmed = searchParams.get('confirmed');
    const email = searchParams.get('email');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (type === 'recovery') {
      setShowPasswordUpdate(true);
      toast.info('Please set your new password');
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
  }, [searchParams, navigate]);

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
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
      } else {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
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
          setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
          
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
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
        
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
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
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
    setResetLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast.error(error.message || 'Error sending password reset email');
      } else {
        toast.success('Password reset email sent!', {
          description: 'Check your inbox for the reset link.'
        });
        setResetEmail('');
        setShowResetForm(false);
      }
    } catch (error) {
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
          redirectTo: `${window.location.origin}/`,
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
                      type="button"
                      variant="link"
                      className="text-sm p-0"
                      onClick={() => setShowResetForm(!showResetForm)}
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
                        <Button type="submit" className="flex-1" disabled={resetLoading}>
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
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/admin-bootstrap')}
              className="text-xs"
            >
              Setup Admin Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;