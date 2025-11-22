import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentRequest {
  paymentId: string;
  documentType: 'invoice' | 'remittance';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    console.log(`📥 Document request from user ${user.id}`);

    const { paymentId, documentType }: DocumentRequest = await req.json();
    console.log(`📄 Requesting ${documentType} for payment ${paymentId}`);

    // Get payment record with booking info
    const { data: payment, error: paymentError } = await supabaseClient
      .from("owner_payments")
      .select("*, booking_id")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      throw new Error("Payment record not found");
    }

    console.log(`💰 Payment found - Owner: ${payment.owner_id}, Booking: ${payment.booking_id}`);

    // Check if user is owner or admin
    const isOwner = payment.owner_id === user.id;
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    
    const isAdmin = !!roleData;

    // Check if user is a customer with a booking linked to this payment
    let isCustomer = false;
    if (payment.booking_id) {
      const { data: booking } = await supabaseClient
        .from("parking_bookings")
        .select("user_id")
        .eq("id", payment.booking_id)
        .single();
      
      isCustomer = booking?.user_id === user.id;
      console.log(`🎫 Booking check - User is customer: ${isCustomer}`);
    }

    if (!isOwner && !isAdmin && !isCustomer) {
      console.error("Access denied - Not owner, admin, or customer");
      throw new Error("Access denied");
    }

    console.log(`✅ Access granted - Owner: ${isOwner}, Admin: ${isAdmin}, Customer: ${isCustomer}`);

    const filePath = documentType === 'invoice' ? payment.invoice_url : payment.remittance_advice_url;

    if (!filePath) {
      console.error(`Document not available - ${documentType} URL is null`);
      throw new Error(`${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} not available`);
    }

    console.log(`📁 File path: ${filePath}`);

    // Generate signed URL (15 minutes expiry) using service role to bypass RLS
    const { data: urlData, error: urlError } = await supabaseClient.storage
      .from("owner-payment-documents")
      .createSignedUrl(filePath, 900, { download: `${documentType}_${paymentId}.pdf` });

    if (urlError || !urlData) {
      console.error("URL generation error:", urlError);
      throw new Error(`Failed to generate download URL: ${urlError?.message || 'Unknown error'}`);
    }

    console.log(`✅ Signed URL generated successfully`);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return new Response(
      JSON.stringify({ 
        url: urlData.signedUrl,
        expiresAt,
        documentType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Unauthorized") || error.message.includes("Access denied") ? 403 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
