
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
    
    console.log('Starting signup with redirect URL:', redirectUrl);
    
    // Use Supabase's native email confirmation
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

    // If Supabase's native email fails, try custom confirmation email as fallback
    if (error && error.message.includes('Error sending confirmation email') && data?.user) {
      console.log('Supabase email failed, trying custom confirmation email...');
      try {
        const confirmationUrl = `${redirectUrl}?token_hash=confirm&type=signup&user_id=${data.user.id}`;
        
        const emailResult = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: email,
            fullName: fullName,
            confirmationUrl: confirmationUrl
          }
        });
        
        if (emailResult.error) {
          console.error('Custom confirmation email failed:', emailResult.error);
          throw emailResult.error;
        }
        
        console.log('Custom confirmation email sent successfully:', emailResult.data);
        return { error: null };
      } catch (customEmailError) {
        console.error('Custom confirmation email also failed:', customEmailError);
        return { error: new Error('Failed to send confirmation email. Please try again.') };
      }
    }

    // Send admin notification after successful signup (only if no error)
    if (!error && data.user) {
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

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
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
