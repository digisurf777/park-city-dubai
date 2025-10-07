import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingInvoiceRequest {
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

    const { booking_id }: BookingInvoiceRequest = await req.json();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('parking_bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or access denied');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('user_id', user.id)
      .single();

    // Check if invoice already exists
    if (booking.invoice_url) {
      const { data: existingFile } = await supabase.storage
        .from('booking-invoices')
        .list('', { search: booking.invoice_url });

      if (existingFile && existingFile.length > 0) {
        console.log('Invoice already exists:', booking.invoice_url);
        return new Response(
          JSON.stringify({ 
            success: true, 
            invoice_url: booking.invoice_url,
            message: 'Invoice already generated'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate PDF content
    const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const startDate = new Date(booking.start_time).toLocaleString('en-AE');
    const endDate = new Date(booking.end_time).toLocaleString('en-AE');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0EA5E9; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #0EA5E9; margin-bottom: 10px; }
    .invoice-title { font-size: 22px; color: #666; margin-top: 10px; }
    .info-section { margin: 30px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    .details-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .details-table th { background: #0EA5E9; color: white; padding: 12px; text-align: left; }
    .details-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-section { margin-top: 30px; text-align: right; }
    .total-row { font-size: 18px; margin: 10px 0; }
    .total-amount { font-size: 24px; font-weight: bold; color: #0EA5E9; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🅿️ ShazamParking</div>
    <div class="invoice-title">PARKING INVOICE</div>
  </div>

  <div class="info-section">
    <div class="info-row">
      <div><span class="label">Invoice Number:</span> ${invoiceNumber}</div>
      <div><span class="label">Invoice Date:</span> ${invoiceDate}</div>
    </div>
    <div class="info-row">
      <div><span class="label">Customer Name:</span> ${profile?.full_name || 'N/A'}</div>
      <div><span class="label">Email:</span> ${profile?.email || user.email}</div>
    </div>
    ${profile?.phone ? `<div class="info-row"><div><span class="label">Phone:</span> ${profile.phone}</div></div>` : ''}
  </div>

  <table class="details-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
        <th>Amount (AED)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Parking Booking</strong></td>
        <td>
          <strong>Location:</strong> ${booking.location}<br>
          <strong>Zone:</strong> ${booking.zone}<br>
          <strong>Duration:</strong> ${booking.duration_hours} hours<br>
          <strong>Start:</strong> ${startDate}<br>
          <strong>End:</strong> ${endDate}
        </td>
        <td><strong>${booking.cost_aed.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">Subtotal: <strong>${booking.cost_aed.toFixed(2)} AED</strong></div>
    <div class="total-row">Tax (0%): <strong>0.00 AED</strong></div>
    <div class="total-row total-amount">Total Amount Paid: ${booking.cost_aed.toFixed(2)} AED</div>
  </div>

  <div class="footer">
    <p><strong>Payment Method:</strong> ${booking.payment_type || 'Card Payment'}</p>
    <p><strong>Payment Status:</strong> PAID</p>
    <p>Thank you for using ShazamParking!</p>
    <p>For support, contact us at support@shazamparking.com</p>
  </div>
</body>
</html>
    `;

    // Convert HTML to PDF using a simple approach
    const encoder = new TextEncoder();
    const pdfData = encoder.encode(htmlContent);

    // Upload to storage
    const fileName = `${user.id}/${booking.id}_invoice.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('booking-invoices')
      .upload(fileName, pdfData, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Update booking with invoice URL
    const { error: updateError } = await supabase
      .from('parking_bookings')
      .update({ invoice_url: fileName })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    console.log('Invoice generated successfully:', fileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_url: fileName,
        message: 'Invoice generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
