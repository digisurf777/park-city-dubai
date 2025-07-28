import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, Building, Mail } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify reCAPTCHA first
      const { data: recaptchaResult, error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      });

      if (recaptchaError || !recaptchaResult?.success) {
        toast.error('reCAPTCHA verification failed. Please try again.');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setLoading(false);
        return;
      }

      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error(error.message, {
            duration: 5000,
            description: 'Check your inbox and click the confirmation link.'
          });
        } else {
          toast.error(error.message || 'Error during login');
        }
      } else {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple rapid submissions
    if (loading || rateLimited) {
      return;
    }
    
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
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
      // Verify reCAPTCHA first
      const { data: recaptchaResult, error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      });

      if (recaptchaError || !recaptchaResult?.success) {
        toast.error('reCAPTCHA verification failed. Please try again.');
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setLoading(false);
        return;
      }

      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName, 'seeker');
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email address is already registered');
        } else if (error.message.includes('email rate limit exceeded') || error.message.includes('429') || error.code === 'over_email_send_rate_limit') {
          // Handle rate limit error
          setRateLimited(true);
          toast.error('Email system temporarily busy', {
            duration: 15000,
            description: 'Your account may have been created but email confirmation is delayed. Try logging in after a few minutes.'
          });
          
          // Clear the form since account might be created
          setSignupForm({ email: '', password: '', confirmPassword: '', fullName: '' });
          
          // Reset rate limit after 5 minutes
          setTimeout(() => {
            setRateLimited(false);
          }, 5 * 60 * 1000);
        } else {
          toast.error(error.message || 'Error during registration');
        }
      } else {
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
                  
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6Ld9JHQrAAAAAFy0tCtaL4NdLcJpA9mrcP_trg1B"
                      onChange={(token) => setRecaptchaToken(token)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading || !recaptchaToken}>
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
                  
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6Ld9JHQrAAAAAFy0tCtaL4NdLcJpA9mrcP_trg1B"
                      onChange={(token) => setRecaptchaToken(token)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading || rateLimited || !recaptchaToken}>
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