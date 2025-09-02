import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VerificationStatus {
  status: 'pending' | 'approved' | 'verified' | 'rejected' | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useVerificationStatus = (): VerificationStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'verified' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching verification status for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('user_verifications')
        .select('verification_status')
        .eq('user_id', user.id)
        .single();

      console.log('Verification query result:', { data, error: fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Verification fetch error:', fetchError);
        throw fetchError;
      }

      const verificationStatus = data?.verification_status;
      console.log('Parsed verification status:', verificationStatus);
      
      if (verificationStatus === 'pending' || verificationStatus === 'approved' || verificationStatus === 'verified' || verificationStatus === 'rejected') {
        console.log('Setting status to:', verificationStatus);
        setStatus(verificationStatus);
      } else {
        console.log('No valid verification status found, setting to null');
        setStatus(null);
      }
    } catch (err: any) {
      console.error('Error fetching verification status:', err);
      setError(err.message || 'Failed to fetch verification status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for verification status changes
  useEffect(() => {
    if (!user) return;

    fetchVerificationStatus();

    const channel = supabase
      .channel(`verification-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_verifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Verification status changed:', payload);
          if (payload.new && typeof payload.new === 'object' && 'verification_status' in payload.new) {
            const newStatus = payload.new.verification_status;
            if (newStatus === 'pending' || newStatus === 'approved' || newStatus === 'verified' || newStatus === 'rejected') {
              setStatus(newStatus);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refresh = () => {
    fetchVerificationStatus();
  };

  return {
    status,
    loading,
    error,
    refresh
  };
};