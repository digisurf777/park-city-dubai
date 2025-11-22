import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate Invoice PDF
const generateInvoicePDF = (payment: any, ownerInfo: any, logoData?: string): ArrayBuffer => {
  const doc = new jsPDF();
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Add logo if available
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 20, 10, 40, 15);
    } catch (e) {
      console.error('Error adding logo to invoice:', e);
    }
  }

  // Company header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235);
  doc.text('ShazamParking', logoData ? 70 : 105, 20, { align: logoData ? 'left' : 'center' });
  
  // Invoice title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('PAYMENT INVOICE', 105, 35, { align: 'center' });
  
  // Draw line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let yPos = 55;
  
  doc.text('Invoice Date:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(formatDate(payment.payment_date), 70, yPos);
  
  doc.setTextColor(100, 100, 100);
  doc.text('Reference:', 120, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(payment.reference_number || 'N/A', 150, yPos);
  
  // Payment To section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment To:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Owner Name:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(ownerInfo.full_name || 'N/A', 70, yPos);
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text('Email:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(ownerInfo.email || 'N/A', 70, yPos);
  
  // Payment Details section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Details:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Period:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatDate(payment.payment_period_start)} - ${formatDate(payment.payment_period_end)}`, 70, yPos);
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text('Payment Method:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(payment.payment_method || 'Bank Transfer', 70, yPos);
  
  // Optional: Property / Listing details
  if (payment.listing_title || payment.listing_address || payment.location) {
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Property:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    const property = payment.listing_title || payment.location || '—';
    doc.text(property, 70, yPos);

    if (payment.listing_address || payment.zone) {
      yPos += 7;
      doc.setTextColor(100, 100, 100);
      doc.text('Address/Zone:', 20, yPos);
      doc.setTextColor(0, 0, 0);
      const addr = payment.listing_address ? `${payment.listing_address}` : `${payment.location || ''} (${payment.zone || ''})`;
      doc.text(addr, 70, yPos);
    }
  }

  // Booking details if linked
  if (payment.booking_id && payment.booking_location) {
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Booking Details:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Location:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(payment.booking_location, 70, yPos);
    
    if (payment.booking_zone) {
      yPos += 7;
      doc.setTextColor(100, 100, 100);
      doc.text('Zone:', 20, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(payment.booking_zone, 70, yPos);
    }
    
    if (payment.booking_start_time && payment.booking_end_time) {
      yPos += 7;
      doc.setTextColor(100, 100, 100);
      doc.text('Rental Period:', 20, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`${formatDate(payment.booking_start_time)} - ${formatDate(payment.booking_end_time)}`, 70, yPos);
    }
  }

  if (payment.notes) {
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Notes:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    const notes = doc.splitTextToSize(payment.notes, 120);
    doc.text(notes, 70, yPos);
    yPos += (notes.length - 1) * 7;
  }

  // Amount box
  yPos += 20;
  doc.setFillColor(243, 244, 246); // Light gray
  doc.rect(20, yPos - 5, 170, 20, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Amount Paid:', 30, yPos + 5);
  
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`AED ${parseFloat(payment.amount_aed).toFixed(2)}`, 150, yPos + 5);
  
  // Footer
  yPos = 270;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
  doc.setFontSize(8);
  doc.text('This is an automated invoice generated by ShazamParking system.', 105, yPos + 5, { align: 'center' });
  
  return doc.output('arraybuffer');
};

// Generate Remittance PDF
const generateRemittancePDF = (payment: any, ownerInfo: any, logoData?: string): ArrayBuffer => {
  const doc = new jsPDF();
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Add logo if available
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 20, 10, 40, 15);
    } catch (e) {
      console.error('Error adding logo to remittance:', e);
    }
  }

  // Company header
  doc.setFontSize(24);
  doc.setTextColor(22, 163, 74);
  doc.text('ShazamParking', logoData ? 70 : 105, 20, { align: logoData ? 'left' : 'center' });
  
  // Document title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('REMITTANCE ADVICE', 105, 35, { align: 'center' });
  
  // Draw line
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);
  
  // Payment details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let yPos = 55;
  
  doc.text('Payment Date:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(formatDate(payment.payment_date), 70, yPos);
  
  doc.setTextColor(100, 100, 100);
  doc.text('Reference:', 120, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(payment.reference_number || 'N/A', 150, yPos);
  
  // Payee Information section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payee Information:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Name:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(ownerInfo.full_name || 'N/A', 70, yPos);
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text('Email:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(ownerInfo.email || 'N/A', 70, yPos);
  
  // Payment Information section
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Information:', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Payment Period:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`${formatDate(payment.payment_period_start)} - ${formatDate(payment.payment_period_end)}`, 70, yPos);
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text('Payment Method:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(payment.payment_method || 'Bank Transfer', 70, yPos);
  
  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text('Status:', 20, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(payment.status, 70, yPos);
  
  if (payment.notes) {
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Notes:', 20, yPos);
    doc.setTextColor(0, 0, 0);
    const notes = doc.splitTextToSize(payment.notes, 120);
    doc.text(notes, 70, yPos);
    yPos += (notes.length - 1) * 7;
  }
  
  // Amount box
  yPos += 20;
  doc.setFillColor(240, 253, 244); // Light green
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos - 5, 170, 20, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('Amount Remitted:', 30, yPos + 5);
  
  doc.setFontSize(18);
  doc.setTextColor(22, 163, 74); // Green
  doc.text(`AED ${parseFloat(payment.amount_aed).toFixed(2)}`, 150, yPos + 5);
  
  // Footer
  yPos = 270;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This remittance advice confirms the payment has been processed.', 105, yPos, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Auto-generated by ShazamParking system on ${formatDate(new Date().toISOString())}`, 105, yPos + 5, { align: 'center' });
  
  return doc.output('arraybuffer');
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRole) {
      throw new Error('Admin access required');
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    console.log('Generating PDFs for payment:', paymentId);

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('owner_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // Load logo from function assets (local file for reliability)
    let logoData: string | undefined;
    try {
      const logoBytes = await Deno.readFile(new URL('./logo.png', import.meta.url));
      let binary = '';
      for (const b of logoBytes) binary += String.fromCharCode(b);
      logoData = `data:image/png;base64,${btoa(binary)}`;
    } catch (e) {
      console.log('Logo not found locally, continuing without it:', e);
    }

    // Resolve owner info with robust fallbacks (avoid RPC that depends on auth.uid())
    let owner: { full_name: string; email: string } = { full_name: 'Property Owner', email: '' };
    try {
      // 1) Try Auth admin API
      const { data: adminRes } = await supabaseClient.auth.admin.getUserById(payment.owner_id);
      const user = adminRes?.user;
      let resolvedName = '';
      if (user) {
        const m: Record<string, any> = user.user_metadata || {};
        resolvedName = m.full_name || m.fullName || m.name || [
          m.firstName || m.first_name || m.given_name,
          m.lastName || m.last_name || m.family_name
        ].filter(Boolean).join(' ');
        owner.email = user.email || '';
      }

      // 2) Fallback to profiles
      if (!resolvedName || /^unknown/i.test(String(resolvedName))) {
        const { data: prof } = await supabaseClient
          .from('profiles')
          .select('full_name,email')
          .eq('user_id', payment.owner_id)
          .maybeSingle();
        if (prof) {
          resolvedName = prof.full_name || resolvedName;
          owner.email = owner.email || prof.email || '';
        }
      }

      // Finalize
      owner.full_name = (resolvedName && !/^unknown/.test(resolvedName)) ? resolvedName : 'Property Owner';
    } catch (e) {
      console.log('Owner info resolution error:', e);
    }

    // Enrich payment with listing/booking info for the document
    let augmentedPayment: any = { ...payment };
    try {
      if (payment.listing_id) {
        const { data: listing } = await supabaseClient
          .from('parking_listings')
          .select('title,address,zone')
          .eq('id', payment.listing_id)
          .maybeSingle();
        if (listing) {
          augmentedPayment.listing_title = listing.title;
          augmentedPayment.listing_address = listing.address;
          augmentedPayment.zone = listing.zone || augmentedPayment.zone;
        }
      }
      
      if (payment.booking_id) {
        const { data: booking } = await supabaseClient
          .from('parking_bookings')
          .select('location,zone,start_time,end_time')
          .eq('id', payment.booking_id)
          .maybeSingle();
        if (booking) {
          augmentedPayment.booking_location = booking.location;
          augmentedPayment.booking_zone = booking.zone;
          augmentedPayment.booking_start_time = booking.start_time;
          augmentedPayment.booking_end_time = booking.end_time;
        }
      }
    } catch (e) {
      console.log('Meta enrichment error:', e);
    }

    console.log('Generating invoice PDF...');
    const invoiceArrayBuffer = generateInvoicePDF(augmentedPayment, owner, logoData);
    const invoiceBlob = new Blob([invoiceArrayBuffer], { type: 'application/pdf' });

    console.log('Generating remittance PDF...');
    const remittanceArrayBuffer = generateRemittancePDF(augmentedPayment, owner, logoData);
    const remittanceBlob = new Blob([remittanceArrayBuffer], { type: 'application/pdf' });

    // Upload to storage
    const invoicePath = `${payment.owner_id}/invoice_${paymentId}.pdf`;
    const remittancePath = `${payment.owner_id}/remittance_${paymentId}.pdf`;

    console.log('Uploading invoice to storage...');
    const { error: invoiceUploadError } = await supabaseClient.storage
      .from('owner-payment-documents')
      .upload(invoicePath, invoiceBlob, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0'
      });

    if (invoiceUploadError) {
      console.error('Invoice upload error:', invoiceUploadError);
      throw invoiceUploadError;
    }

    console.log('Uploading remittance to storage...');
    const { error: remittanceUploadError } = await supabaseClient.storage
      .from('owner-payment-documents')
      .upload(remittancePath, remittanceBlob, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0'
      });

    if (remittanceUploadError) {
      console.error('Remittance upload error:', remittanceUploadError);
      throw remittanceUploadError;
    }

    // Update payment record with document URLs
    const { error: updateError } = await supabaseClient
      .from('owner_payments')
      .update({
        invoice_url: invoicePath,
        remittance_advice_url: remittancePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Insert into owner_payment_documents table for document history
    const documentsToInsert = [
      {
        payment_id: paymentId,
        document_type: 'invoice',
        file_path: invoicePath,
        file_name: `invoice_${paymentId}.pdf`,
        file_size_bytes: invoiceBlob.size,
        uploaded_by: user.id
      },
      {
        payment_id: paymentId,
        document_type: 'remittance',
        file_path: remittancePath,
        file_name: `remittance_${paymentId}.pdf`,
        file_size_bytes: remittanceBlob.size,
        uploaded_by: user.id
      }
    ];

    const { error: docsInsertError } = await supabaseClient
      .from('owner_payment_documents')
      .insert(documentsToInsert);

    if (docsInsertError) {
      console.error('Document history insert error:', docsInsertError);
      // Continue even if this fails - backward compatibility
    }

    // If payment is linked to a booking, update the booking's invoice_url for customer access
    if (payment.booking_id) {
      const { error: bookingUpdateError } = await supabaseClient
        .from('parking_bookings')
        .update({ 
          invoice_url: invoicePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id);

      if (bookingUpdateError) {
        console.error('Booking update error:', bookingUpdateError);
      } else {
        console.log(`✅ Invoice also linked to booking ${payment.booking_id} for customer access`);
      }
    }

    console.log('PDFs generated successfully for payment:', paymentId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDFs generated successfully',
        invoice_url: invoicePath,
        remittance_advice_url: remittancePath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating PDFs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
