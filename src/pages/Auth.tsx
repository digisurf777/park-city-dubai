import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [rateLimited, setRateLimited] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

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
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          toast.error('Email Not Verified', {
            duration: 10000,
            description: 'You must verify your email address before logging in. Check your inbox and click the verification link.'
          });
        } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          toast.error('Invalid Login', {
            duration: 8000,
            description: 'Please check your email and password. If you just registered, make sure you verified your email first.'
          });
        } else if (error.message.includes('Too many requests') || error.message.includes('429')) {
          toast.error('Too Many Login Attempts', {
            duration: 12000,
            description: 'Please wait a few minutes before trying to log in again.'
          });
        } else {
          toast.error('Login Failed', {
            duration: 8000,
            description: error.message || 'Please check your credentials and try again.'
          });
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple rapid submissions
    if (loading || rateLimited) {
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName, 'seeker');
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email address is already registered', {
            duration: 8000,
            description: 'Try logging in instead, or use a different email address.'
          });
        } else if (error.code === 'email_rate_limited_but_user_created') {
          // Special handling for rate limit with user created
          setRateLimited(true);
          toast.warning('Account Created - Email Delayed', {
            duration: 20000,
            description: 'Your account has been created successfully, but email verification is delayed due to high demand. You can try logging in after a few minutes.'
          });
          
          // Clear the form since account was created
          setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
          
          // Reset rate limit after 3 minutes
          setTimeout(() => {
            setRateLimited(false);
          }, 3 * 60 * 1000);
        } else if (error.message.includes('email rate limit exceeded') || error.message.includes('429') || error.code === 'over_email_send_rate_limit') {
          // Handle pure rate limit error
          setRateLimited(true);
          toast.error('Email System Busy', {
            duration: 15000,
            description: 'Too many email requests. Please wait a few minutes before trying again.'
          });
          
          // Reset rate limit after 5 minutes
          setTimeout(() => {
            setRateLimited(false);
          }, 5 * 60 * 1000);
        } else if (error.message.includes('email') || error.message.includes('Email')) {
          toast.error('Email Delivery Issue', {
            duration: 10000,
            description: error.message + ' Please check your email address and try again.'
          });
        } else if (error.message.includes('password') || error.message.includes('Password')) {
          toast.error('Password Issue', {
            duration: 8000,
            description: error.message + ' Please choose a stronger password.'
          });
        } else {
          toast.error('Registration Failed', {
            duration: 10000,
            description: error.message || 'An unexpected error occurred. Please try again.'
          });
        }
      } else {
        toast.success('Account Created Successfully!', {
          duration: 8000,
          description: 'Check your inbox for a verification email. You must verify your email before logging in.'
        });
        setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
        
        // Show additional guidance about email verification
        setTimeout(() => {
          toast.info('Email Verification Required', {
            duration: 12000,
            description: 'Please check your email (including spam folder) and click the verification link to activate your account.'
          });
        }, 3000);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
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
          description: 'Check your inbox.'
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
            </TabsContent>
            
            <TabsContent value="signup">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;