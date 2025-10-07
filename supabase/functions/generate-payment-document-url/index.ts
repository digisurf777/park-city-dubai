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
      throw new Error("Unauthorized");
    }

    const { paymentId, documentType }: DocumentRequest = await req.json();

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("owner_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment record not found");
    }

    // Check if user is owner or admin
    const isOwner = payment.owner_id === user.id;
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    
    const isAdmin = !!roleData;

    if (!isOwner && !isAdmin) {
      throw new Error("Access denied");
    }

    const filePath = documentType === 'invoice' ? payment.invoice_url : payment.remittance_advice_url;

    if (!filePath) {
      throw new Error(`${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} not available`);
    }

    // Generate signed URL (15 minutes expiry)
    const { data: urlData, error: urlError } = await supabaseClient.storage
      .from("owner-payment-documents")
      .createSignedUrl(filePath, 900); // 15 minutes

    if (urlError) {
      console.error("URL generation error:", urlError);
      throw new Error(`Failed to generate download URL: ${urlError.message}`);
    }

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
