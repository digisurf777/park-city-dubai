import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRole) throw new Error('Admin access required');

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error('Payment ID is required');

    console.log('Deleting owner payment:', paymentId);

    const { data: payment, error: paymentError } = await supabase
      .from('owner_payments')
      .select('id, owner_id, invoice_url, remittance_advice_url')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) throw new Error('Payment not found');

    // Delete storage files if present
    const paths: string[] = [];
    if (payment.invoice_url) paths.push(payment.invoice_url);
    if (payment.remittance_advice_url) paths.push(payment.remittance_advice_url);

    if (paths.length > 0) {
      console.log('Removing files from storage:', paths);
      const { error: removeErr } = await supabase.storage
        .from('owner-payment-documents')
        .remove(paths);
      if (removeErr) {
        console.warn('Storage removal warning:', removeErr);
      }
    }

    // Delete DB record
    const { error: deleteErr } = await supabase
      .from('owner_payments')
      .delete()
      .eq('id', paymentId);

    if (deleteErr) throw deleteErr;

    console.log('Owner payment deleted successfully:', paymentId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Delete owner payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});