import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Link } from 'react-router-dom';

const Auth = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Auth: Attempting to sign in:', signInData.email);
      
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        console.error('Auth: Sign in error:', error);
        
        if (error.message?.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error("Please check your email and click the confirmation link before signing in.");
        } else {
          toast.error(error.message || "Sign in failed. Please try again.");
        }
        return;
      }

      console.log('Auth: Sign in successful, user will be redirected automatically');
      toast.success("Signed in successfully!");
      
      // For admin user, let the auth provider handle redirection
      // For regular users, redirect to home
      if (signInData.email !== 'anwerhammad479@gmail.com') {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Auth: Sign in exception:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Enter your email and password to sign in</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={signInData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={signInData.password}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button disabled={isLoading} onClick={handleSignIn}>
            {isLoading ? (
              <>
                Signing In...
                <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link to="/auth?type=signup" className="text-blue-500 hover:underline">Sign up</Link>
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Forgot your password? <Link to="/auth?type=recovery" className="text-blue-500 hover:underline">Reset password</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
