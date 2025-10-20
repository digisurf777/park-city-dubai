import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteRequest {
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

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Admin access required");
    }

    const { paymentId, documentType }: DeleteRequest = await req.json();

    console.log('🗑️ Admin deleting payment document:', { paymentId, documentType });

    // Get current file path
    const fieldName = documentType === 'invoice' ? 'invoice_url' : 'remittance_advice_url';
    const { data: payment, error: fetchError } = await supabaseClient
      .from("owner_payments")
      .select(fieldName)
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      throw new Error("Payment not found");
    }

    const filePath = payment[fieldName];
    if (!filePath) {
      throw new Error("Document not found");
    }

    // Delete from storage
    const { error: deleteError } = await supabaseClient.storage
      .from("owner-payment-documents")
      .remove([filePath]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      // Continue even if storage delete fails
    }

    // Update payment record to remove the URL
    const { error: updateError } = await supabaseClient
      .from("owner_payments")
      .update({ 
        [fieldName]: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update payment record: ${updateError.message}`);
    }

    console.log(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance'} deleted successfully for payment ${paymentId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} deleted successfully`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
