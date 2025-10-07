import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    // Authenticate user (support Authorization header or token query param for mobile downloads)
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    const authHeader = req.headers.get('Authorization');
    const token = tokenParam || (authHeader ? authHeader.replace('Bearer ', '') : '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const bookingId = url.searchParams.get('booking_id');

    if (!bookingId) {
      throw new Error('booking_id is required');
    }

    // Get booking with invoice URL
    const { data: booking, error: bookingError } = await supabase
      .from('parking_bookings')
      .select('invoice_url, user_id')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or access denied');
    }

    if (!booking.invoice_url) {
      throw new Error('Invoice not yet generated');
    }

    // Get signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('booking-invoices')
      .createSignedUrl(booking.invoice_url, 60); // 1 minute to download

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    // Fetch the PDF from storage
    const pdfResponse = await fetch(signedUrlData.signedUrl);
    
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch invoice PDF');
    }

    const pdfBlob = await pdfResponse.blob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // Extract filename from invoice_url
    const filename = booking.invoice_url.split('/').pop() || 'invoice.pdf';

    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('Error downloading invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
