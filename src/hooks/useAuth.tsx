
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
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

  console.log('AuthProvider: Initializing');

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no user');
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: User signed in successfully');
          // Don't make any Supabase calls here to prevent deadlocks
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out');
          setSession(null);
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: string = 'seeker') => {
    try {
      console.log('AuthProvider: Starting signup process for:', email);
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Use Supabase's native email confirmation with proper redirect
      const redirectUrl = `${window.location.origin}/email-confirmed?redirect_to=/my-account`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('AuthProvider: Signup error:', error);
        return { error };
      }

      console.log('AuthProvider: Signup successful for:', data.user?.email);
      console.log('AuthProvider: Confirmation email will be sent by Supabase to:', email);
      
      // Send admin notification if user was created (keep this separate from email confirmation)
      if (data.user && !data.user.email_confirmed_at) {
        setTimeout(() => {
          supabase.functions.invoke('send-admin-signup-notification', {
            body: {
              email: data.user.email,
              fullName: fullName,
              userType: userType,
            },
          }).catch(notificationError => {
            console.error('Failed to send admin notification:', notificationError);
            // Don't block signup for notification failure
          });
        }, 0);
      }

      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Starting signin process for:', email);
      
      // Clean up auth state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.log('AuthProvider: Global signout failed (continuing):', signOutError);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Signin error:', error);
        return { error };
      }

      console.log('AuthProvider: Signin successful for:', data.user?.email);

      // Force page refresh after successful login
      setTimeout(() => {
        console.log('AuthProvider: Redirecting to home page');
        forcePageRefresh('/');
      }, 1000);

      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Signin exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Starting signout process');
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.error('AuthProvider: Signout error (continuing):', error);
      }

      console.log('AuthProvider: Signout complete, redirecting to auth');
      
      // Force page refresh
      forcePageRefresh('/auth');
    } catch (error) {
      console.error('AuthProvider: Signout exception:', error);
      // Force refresh anyway
      forcePageRefresh('/auth');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?type=recovery`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('AuthProvider: Reset password error:', error);
        return { error };
      }

      console.log('AuthProvider: Password reset email sent to:', email);

      // Also call the edge function for custom email
      try {
        await supabase.functions.invoke('send-password-reset', {
          body: { email },
        });
      } catch (functionError) {
        console.error('AuthProvider: Custom reset email failed:', functionError);
        // Don't fail the whole operation
      }

      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Reset password exception:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('AuthProvider: Update password error:', error);
        return { error };
      }

      console.log('AuthProvider: Password updated successfully');
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Update password exception:', error);
      return { error };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      // Use Supabase's native resend with proper redirect
      const redirectUrl = `${window.location.origin}/email-confirmed?redirect_to=/my-account`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('AuthProvider: Resend confirmation error:', error);
        return { error };
      }

      console.log('AuthProvider: Native confirmation email resent to:', email);
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Resend confirmation exception:', error);
      return { error };
    }
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
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
