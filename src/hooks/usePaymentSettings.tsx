import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentSettings {
  paymentsEnabled: boolean;
  disabledMessage: string;
  loading: boolean;
  error: string | null;
}

export const usePaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    paymentsEnabled: false,
    disabledMessage: 'Payments are currently disabled. Your booking is reserved, but no payment has been taken.',
    loading: true,
    error: null,
  });

  const fetchPaymentSettings = async () => {
    try {
      setSettings(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['payments_enabled', 'payment_disabled_message']);

      if (error) {
        console.error('Error fetching payment settings:', error);
        setSettings(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      const paymentsEnabled = data.find(s => s.setting_key === 'payments_enabled')?.setting_value === 'true';
      const disabledMessage = data.find(s => s.setting_key === 'payment_disabled_message')?.setting_value || 
        'Payments are currently disabled. Your booking is reserved, but no payment has been taken.';

      setSettings({
        paymentsEnabled,
        disabledMessage,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error in fetchPaymentSettings:', err);
      setSettings(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch payment settings',
      }));
    }
  };

  const togglePayments = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: enabled.toString() })
        .eq('setting_key', 'payments_enabled');

      if (error) {
        console.error('Error toggling payments:', error);
        throw error;
      }

      await fetchPaymentSettings();
      return { success: true };
    } catch (err) {
      console.error('Error in togglePayments:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update payment settings' 
      };
    }
  };

  useEffect(() => {
    fetchPaymentSettings();

    // Set up real-time subscription
    const subscription = supabase
      .channel('payment-settings')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'system_settings',
          filter: 'setting_key=in.(payments_enabled,payment_disabled_message)'
        }, 
        () => {
          fetchPaymentSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...settings,
    refresh: fetchPaymentSettings,
    togglePayments,
  };
};