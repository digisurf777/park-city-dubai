
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState, forcePageRefresh } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email_confirmed_at);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer any data fetching to prevent deadlocks
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            // Any additional user data loading would go here
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: string = 'renter') => {
    try {
      // Clean up any existing auth state before signup
      cleanupAuthState();
      
      const redirectUrl = `https://shazamparking.ae/email-confirmed?redirect_to=/my-account`;
      
      console.log('Starting signup process...');
      
      // Create user account with email confirmation required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      });

      console.log('Signup result:', { data, error });

      // If signup successful, send emails
      if (!error && data?.user) {
        // Send confirmation email to user
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: email,
              fullName: fullName,
              confirmationUrl: redirectUrl
            }
          });
          console.log('Confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the signup if email fails
        }

        // Send admin notification after successful signup
        try {
          await supabase.functions.invoke('send-admin-signup-notification', {
            body: {
              email: email,
              fullName: fullName,
              userType: userType
            }
          });
          console.log('Admin notification sent successfully');
        } catch (emailError) {
          console.error('Failed to send admin notification:', emailError);
          // Don't fail the signup if admin email fails
        }
      }
      
      return { error };
    } catch (signupError: any) {
      console.error('Signup error:', signupError);
      return { error: signupError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout error (continuing):', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Force page refresh for clean state
        setTimeout(() => {
          forcePageRefresh('/');
        }, 500);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Signout error (continuing):', err);
      }
      
      // Force page refresh for clean state
      forcePageRefresh('/auth');
    } catch (error) {
      console.error('Signout error:', error);
      // Force refresh anyway to clear state
      forcePageRefresh('/auth');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://shazamparking.ae/auth?type=recovery`
      });
      
      if (error) {
        return { error };
      }
      
      // Also send custom password reset email
      try {
        await supabase.functions.invoke('send-password-reset', {
          body: {
            email: email,
            resetUrl: `https://shazamparking.ae/auth?type=recovery`
          }
        });
      } catch (customEmailError) {
        console.error('Failed to send custom reset email:', customEmailError);
        // Don't fail if custom email fails, Supabase already sent one
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error: error };
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
