import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
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
    const redirectUrl = `${window.location.origin}/email-confirmed`;
    
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

    // Send custom confirmation email after successful signup
    if (!error && data.user && !data.user.email_confirmed_at) {
      try {
        // Generate confirmation URL - this should match Supabase's format
        const confirmationUrl = `${window.location.origin}/email-confirmed`;
        
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: email,
            fullName: fullName,
            confirmationUrl: confirmationUrl
          }
        });
        console.log('Custom confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send custom confirmation email:', emailError);
        // Don't fail the signup if custom email fails
      }

      // Send welcome email immediately after confirmation email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: email,
            name: fullName
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if welcome email fails
      }
    }

    // Send admin notification after successful signup
    if (!error) {
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
        // Don't fail the signup if email fails
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Check if email is confirmed
    if (!error && data.user && !data.user.email_confirmed_at) {
      // Sign out the user immediately if email is not confirmed
      await supabase.auth.signOut();
      return { 
        error: { 
          message: 'Please confirm your email address before logging in. Check your inbox.' 
        } 
      };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    // Send custom password reset email
    if (!error) {
      try {
        await supabase.functions.invoke('send-password-reset', {
          body: {
            email: email,
            resetUrl: redirectUrl
          }
        });
        console.log('Custom password reset email sent successfully');
      } catch (emailError) {
        console.error('Failed to send custom password reset email:', emailError);
        // Don't fail the reset if custom email fails, Supabase default will still work
      }
    }
    
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
