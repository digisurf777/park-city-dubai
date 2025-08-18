import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useVerificationStatus = (): VerificationStatus => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
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
      const { data, error: fetchError } = await supabase
        .from('user_verifications')
        .select('verification_status')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const verificationStatus = data?.verification_status;
      if (verificationStatus === 'pending' || verificationStatus === 'approved' || verificationStatus === 'rejected') {
        setStatus(verificationStatus);
      } else {
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
            if (newStatus === 'pending' || newStatus === 'approved' || newStatus === 'rejected') {
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