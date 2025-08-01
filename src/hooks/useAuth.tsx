
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
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
    // First create the user account with disabled email confirmation to prevent double emails
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable automatic email sending
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    });

    console.log('Signup result:', { data, error });

    // Handle successful signup
    if (!error && data.user) {
      try {
        // Generate confirmation URL
        const baseUrl = 'https://shazamparking.ae';
        const confirmationUrl = `${baseUrl}/email-confirmed?token_hash=${data.user.id}&type=signup&redirect_to=${baseUrl}`;
        
        // Send custom confirmation email
        await supabase.functions.invoke('send-signup-confirmation', {
          body: {
            email: email,
            fullName: fullName,
            confirmationUrl: confirmationUrl
          }
        });
        console.log('Confirmation email sent successfully');
        
        // Send admin notification
        await supabase.functions.invoke('send-admin-signup-notification', {
          body: {
            email: email,
            fullName: fullName,
            userType: userType
          }
        });
        console.log('Admin notification sent successfully');
        
      } catch (emailError) {
        console.error('Failed to send emails:', emailError);
        // Don't fail the signup if email fails
      }
      
      // Return success with message about email verification
      return { 
        error: null,
        message: 'Konto zostało utworzone pomyślnie! Sprawdź swoją skrzynkę e-mail, aby potwierdzić adres.'
      };
    }

    // Enhanced error handling for various scenarios
    if (error) {
      console.log('Signup error:', error);
      
      // Check for rate limiting
      if (error.message.includes('email rate limit exceeded') || 
          error.message.includes('429') || 
          error.message.includes('too many') ||
          error.code === 'over_email_send_rate_limit' ||
          error.code === 'email_rate_limit_exceeded') {
        return { 
          error: { 
            message: 'Za dużo prób rejestracji. Proszę poczekać kilka minut przed ponowną próbą.',
            code: 'signup_rate_limited'
          } 
        };
      }
      
      // Check for existing user
      if (error.message.includes('already registered') || 
          error.message.includes('already exists') ||
          error.code === 'email_address_already_exists') {
        return { 
          error: { 
            message: 'Ten adres e-mail jest już zarejestrowany. Spróbuj się zalogować.',
            code: 'user_already_exists'
          } 
        };
      }
      
      // Check for weak password
      if (error.message.includes('password') && 
          (error.message.includes('weak') || error.message.includes('short'))) {
        return { 
          error: { 
            message: 'Hasło jest za słabe. Użyj co najmniej 6 znaków.',
            code: 'weak_password'
          } 
        };
      }
      
      // Default error message
      return { 
        error: { 
          message: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.',
          code: 'signup_error'
        } 
      };
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://shazamparking.ae/`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `https://shazamparking.ae/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
