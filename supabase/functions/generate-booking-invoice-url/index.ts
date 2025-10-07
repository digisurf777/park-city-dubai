import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceUrlRequest {
  booking_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { booking_id }: InvoiceUrlRequest = await req.json();

    // Get booking with invoice URL
    const { data: booking, error: bookingError } = await supabase
      .from('parking_bookings')
      .select('invoice_url, user_id')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or access denied');
    }

    if (!booking.invoice_url) {
      throw new Error('Invoice not yet generated');
    }

    // Generate signed URL (15 minutes expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('booking-invoices')
      .createSignedUrl(booking.invoice_url, 900);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    console.log('Signed URL generated for booking:', booking_id);

    return new Response(
      JSON.stringify({
        success: true,
        signed_url: signedUrlData.signedUrl,
        expires_at: expiresAt,
        booking_id: booking_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating invoice URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
