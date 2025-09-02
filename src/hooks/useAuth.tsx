
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState, forcePageRefresh } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);

  console.log('AuthProvider: Initializing');

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('AuthProvider: Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('AuthProvider: Exception checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'no user');
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: User signed in successfully');
          
          // Only check admin status, no role assignment
          setTimeout(async () => {
            const userId = session.user.id;
            
            // Check admin status
            const adminStatus = await checkAdminStatus(userId);
            setIsAdmin(adminStatus);
            
            console.log('AuthProvider: Admin status set to:', adminStatus);
            
            // Redirect admin user to admin panel
            if (adminStatus && session.user.email === 'anwerhammad479@gmail.com') {
              console.log('AuthProvider: Redirecting admin to admin panel');
              window.location.href = '/admin';
            }
          }, 100);
          
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out');
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthProvider: Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check admin status for existing session
      if (session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: string = 'seeker') => {
    try {
      console.log('AuthProvider: Starting signup process for:', email);
      
      const redirectUrl = `${window.location.origin}/email-confirmed?redirect_to=/`;
      
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
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Signup exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Signin error:', error);
        return { error };
      }

      console.log('AuthProvider: Signin successful for:', data.user?.email);
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
      const redirectUrl = `${window.location.origin}/email-confirmed?redirect_to=/`;
      
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

      console.log('AuthProvider: Confirmation email resent to:', email);
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
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
