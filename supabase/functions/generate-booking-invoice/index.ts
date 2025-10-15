import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

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

    // Check if a final PDF invoice already exists; if it's an older HTML invoice, regenerate as PDF
    if (booking.invoice_url && String(booking.invoice_url).toLowerCase().endsWith('.pdf')) {
      const { data: existingFile } = await supabase.storage
        .from('booking-invoices')
        .list('', { search: booking.invoice_url });

      if (existingFile && existingFile.length > 0) {
        console.log('Invoice PDF already exists:', booking.invoice_url);
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

    // Build data for PDF
    const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(booking.created_at).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const startDate = new Date(booking.start_time).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const endDate = new Date(booking.end_time).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Calculate duration in months from actual booked hours
    const durationMonths = Math.max(1, Math.round(booking.duration_hours / (24 * 30)));
    const showZone = booking.zone && booking.zone !== 'Find Parking Page';

    // Load logo from local file if available
    let logoData: string | undefined;
    try {
      const logoBytes = await Deno.readFile(new URL('./logo.png', import.meta.url));
      let binary = '';
      for (const b of logoBytes) binary += String.fromCharCode(b);
      logoData = `data:image/png;base64,${btoa(binary)}`;
    } catch (_) {
      console.log('Invoice logo not found locally, continuing without it');
    }

    // Create PDF
    const doc = new jsPDF();

    // Header with logo
    if (logoData) {
      try { doc.addImage(logoData, 'PNG', 20, 10, 40, 15); } catch (_) { /* ignore */ }
    }
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233);
    doc.text('ShazamParking', logoData ? 70 : 105, 20, { align: logoData ? 'left' : 'center' });

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('PARKING INVOICE', 105, 35, { align: 'center' });

    // Divider
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(1);
    doc.line(20, 40, 190, 40);

    // Invoice meta
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let y = 55;
    doc.text('Invoice Number:', 20, y); doc.setTextColor(0,0,0); doc.text(invoiceNumber, 60, y);
    doc.setTextColor(100,100,100); doc.text('Invoice Date:', 120, y); doc.setTextColor(0,0,0); doc.text(invoiceDate, 155, y);

    y += 8; doc.setTextColor(100,100,100); doc.text('Customer Name:', 20, y); doc.setTextColor(0,0,0); doc.text(profile?.full_name || 'N/A', 60, y);
    y += 8; doc.setTextColor(100,100,100); doc.text('Email:', 20, y); doc.setTextColor(0,0,0); doc.text((profile?.email || user.email) ?? 'N/A', 60, y);
    if (profile?.phone) { y += 8; doc.setTextColor(100,100,100); doc.text('Phone:', 20, y); doc.setTextColor(0,0,0); doc.text(profile.phone, 60, y); }

    // Booking details
    y += 16; doc.setFontSize(12); doc.setTextColor(0,0,0); doc.text('Booking Details', 20, y);
    y += 8; doc.setFontSize(10); doc.setTextColor(100,100,100); doc.text('Location:', 20, y); doc.setTextColor(0,0,0); doc.text(booking.location, 60, y);
    if (showZone) { y += 7; doc.setTextColor(100,100,100); doc.text('Zone:', 20, y); doc.setTextColor(0,0,0); doc.text(String(booking.zone), 60, y); }
    y += 7; doc.setTextColor(100,100,100); doc.text('Duration:', 20, y); doc.setTextColor(0,0,0); doc.text(`${durationMonths} month${durationMonths>1?'s':''}`, 60, y);
    y += 7; doc.setTextColor(100,100,100); doc.text('Start:', 20, y); doc.setTextColor(0,0,0); doc.text(startDate, 60, y);
    y += 7; doc.setTextColor(100,100,100); doc.text('End:', 20, y); doc.setTextColor(0,0,0); doc.text(endDate, 60, y);

    // Amount section box
    y += 18;
    doc.setFillColor(239, 246, 255); // light blue
    doc.rect(20, y-6, 170, 22, 'F');
    doc.setFontSize(11); doc.setTextColor(100,100,100); doc.text('Total Amount Paid:', 30, y+4);
    doc.setFontSize(18); doc.setTextColor(14,165,233); doc.text(`${Number(booking.cost_aed).toFixed(2)} AED`, 155, y+4, { align: 'right' });

    // Footer
    y = 270; doc.setDrawColor(229,231,235); doc.setLineWidth(0.5); doc.line(20, y, 190, y);
    y += 10; doc.setFontSize(10); doc.setTextColor(100,100,100); doc.text('Payment Status: PAID', 20, y);
    doc.text('Thank you for using ShazamParking!', 105, y, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    // Upload PDF
    const fileName = `${user.id}/${booking.id}_invoice.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('booking-invoices')
      .upload(fileName, pdfBytes, {
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

    console.log('Invoice PDF generated successfully:', fileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_url: fileName,
        message: 'Invoice PDF generated successfully'
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
