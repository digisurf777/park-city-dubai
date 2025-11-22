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

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    const isAdmin = !!adminRole;

    // Get booking with invoice URL
    // Admins can access any booking, regular users can only access their own
    let query = supabase
      .from('parking_bookings')
      .select('invoice_url, user_id')
      .eq('id', booking_id);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: booking, error: bookingError } = await query.single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or access denied');
    }

    if (!booking.invoice_url) {
      throw new Error('Invoice not yet generated');
    }

    // Generate signed URL (15 minutes expiry) - try owner-payment-documents first, fallback to booking-invoices
    let signedUrlData;
    let signedUrlError;
    
    // Try owner-payment-documents bucket first (for admin-uploaded invoices)
    const ownerDocsResult = await supabase.storage
      .from('owner-payment-documents')
      .createSignedUrl(booking.invoice_url, 900);
    
    if (ownerDocsResult.error) {
      // Fallback to booking-invoices bucket
      const bookingInvoicesResult = await supabase.storage
        .from('booking-invoices')
        .createSignedUrl(booking.invoice_url, 900);
      
      signedUrlData = bookingInvoicesResult.data;
      signedUrlError = bookingInvoicesResult.error;
    } else {
      signedUrlData = ownerDocsResult.data;
      signedUrlError = ownerDocsResult.error;
    }

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
