
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState, forcePageRefresh } from '@/utils/authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaEnabled: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
  enrollMFA: (friendlyName?: string) => Promise<{ qrCode: string; secret: string; factorId: string; error: any }>;
  verifyMFA: (code: string, factorId: string) => Promise<{ error: any }>;
  challengeMFA: (factorId: string) => Promise<{ challengeId: string; error: any }>;
  verifyMFAChallenge: (challengeId: string, code: string) => Promise<{ error: any }>;
  unenrollMFA: (factorId: string) => Promise<{ error: any }>;
  getMFAFactors: () => Promise<{ factors: any[]; error: any }>;
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
  const [authState, setAuthState] = useState<{
    user: User | null;
    session: Session | null;
    loading: boolean;
    mfaRequired: boolean;
    mfaEnabled: boolean;
  }>({
    user: null,
    session: null,
    loading: true,
    mfaRequired: false,
    mfaEnabled: false,
  });

  // Destructure for compatibility
  const { user, session, loading, mfaRequired, mfaEnabled } = authState;

  useEffect(() => {
    // Handle OAuth callback tokens from URL hash immediately
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (!error) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (error) {
          // Silent fail for OAuth callback errors
        }
      }
    };
    
    handleOAuthCallback();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Batch state update
        setAuthState(prev => ({
          ...prev,
          session: newSession,
          user: newSession?.user ?? null,
          loading: false,
        }));
        
        // Handle auth events
        if (event === 'SIGNED_IN' && newSession?.user) {
          if (window.location.pathname === '/auth' || window.location.hash.includes('access_token')) {
            window.history.replaceState(null, '', '/');
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({
            ...prev,
            session: null,
            user: null,
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setAuthState(prev => ({
        ...prev,
        session: existingSession,
        user: existingSession?.user ?? null,
        loading: false,
      }));
    });

    return () => {
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
      
      // Send admin notification for new signup
      try {
        console.log('DEBUG: Signup parameters - email:', email, 'fullName:', fullName, 'userType:', userType);
        console.log('DEBUG: Supabase user data:', data.user?.email, data.user?.user_metadata);
        
        const notificationData = {
          email: data.user?.email || email, // Use the email parameter as fallback
          fullName: fullName,
          userType: userType,
        };
        
        console.log('DEBUG: Final notification data:', notificationData);
        
        await supabase.functions.invoke('send-admin-signup-notification', {
          body: notificationData,
        });
        console.log('Admin signup notification sent successfully');
      } catch (notificationError) {
        console.error('Failed to send admin signup notification:', notificationError);
        // Don't fail signup if notification fails
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
      // Use auth page with recovery type parameter
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

  // Check if user is admin and needs MFA
  useEffect(() => {
    const checkMFARequirement = async () => {
      if (user) {
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
          
          if (roleData) {
            const { data: mfaData } = await supabase.auth.mfa.listFactors();
            const hasEnabledFactor = mfaData?.totp?.some((factor: any) => 
              factor.status === 'verified'
            );
            
            setAuthState(prev => ({
              ...prev,
              mfaRequired: true,
              mfaEnabled: !!hasEnabledFactor,
            }));
          } else {
            setAuthState(prev => ({
              ...prev,
              mfaRequired: false,
              mfaEnabled: false,
            }));
          }
        } catch (error) {
          // Silent fail for MFA check
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          mfaRequired: false,
          mfaEnabled: false,
        }));
      }
    };
    
    checkMFARequirement();
  }, [user]);

  // Enroll in MFA
  const enrollMFA = async (friendlyName: string = 'Admin Authentication') => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });
      
      if (error) return { qrCode: '', secret: '', factorId: '', error };
      
      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
        error: null,
      };
    } catch (error) {
      return { qrCode: '', secret: '', factorId: '', error };
    }
  };

  // Verify MFA enrollment
  const verifyMFA = async (code: string, factorId: string) => {
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) return { error: challenge.error };

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });
      
      if (!error) {
        // Force-refresh session so the access token reflects AAL2 immediately
        try {
          await supabase.auth.refreshSession();
          // Small wait loop to ensure the SDK exposes aal2 on the session
          const start = Date.now();
          while (Date.now() - start < 6000) {
            const { data: s } = await supabase.auth.getSession();
            const aal = (s.session as any)?.aal;
            if (aal === 'aal2') break;
            await new Promise((r) => setTimeout(r, 250));
          }
        } catch (e) {
          console.warn('verifyMFA: refreshSession failed (continuing)', e);
        }

        // Update MFA status in database (best-effort)
        await supabase
          .from('user_mfa_requirements')
          .update({ mfa_enabled_at: new Date().toISOString() })
          .eq('user_id', user?.id);
        
        setAuthState(prev => ({ ...prev, mfaEnabled: true }));
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Challenge MFA during login
  const challengeMFA = async (factorId: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });
      
      return { challengeId: data?.id || '', error };
    } catch (error) {
      return { challengeId: '', error };
    }
  };

  // Verify MFA challenge
  const verifyMFAChallenge = async (challengeId: string, code: string) => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factorId = factors?.totp?.[0]?.id;
      
      if (!factorId) {
        return { error: { message: 'No MFA factor found' } };
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (!error) {
        // Ensure the client has an upgraded AAL2 token immediately
        try {
          await supabase.auth.refreshSession();
          const start = Date.now();
          while (Date.now() - start < 6000) {
            const { data: s } = await supabase.auth.getSession();
            const aal = (s.session as any)?.aal;
            if (aal === 'aal2') break;
            await new Promise((r) => setTimeout(r, 250));
          }
        } catch (e) {
          console.warn('verifyMFAChallenge: refreshSession failed (continuing)', e);
        }
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Get all MFA factors
  const getMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      return { factors: data?.totp || [], error };
    } catch (error) {
      return { factors: [], error };
    }
  };

  // Unenroll MFA (admin only, with super admin verification)
  const unenrollMFA = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (!error) {
        setAuthState(prev => ({ ...prev, mfaEnabled: false }));
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    mfaRequired,
    mfaEnabled,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail,
    enrollMFA,
    verifyMFA,
    challengeMFA,
    verifyMFAChallenge,
    unenrollMFA,
    getMFAFactors,
  }), [user, session, loading, mfaRequired, mfaEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
