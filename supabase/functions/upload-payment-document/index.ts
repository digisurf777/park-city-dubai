import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  paymentId: string;
  documentType: 'invoice' | 'remittance';
  fileName: string;
  fileData: string; // base64 encoded
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

    const { paymentId, documentType, fileName, fileData }: UploadRequest = await req.json();

    console.log('📤 Admin uploading payment document:', { paymentId, documentType, fileName });

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Upload to storage
    const filePath = `${paymentId}/${documentType}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("owner-payment-documents")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }

    // Update payment record
    const updateField = documentType === 'invoice' ? 'invoice_url' : 'remittance_advice_url';
    const { error: updateError } = await supabaseClient
      .from("owner_payments")
      .update({ 
        [updateField]: filePath,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update payment record: ${updateError.message}`);
    }

    console.log(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance'} uploaded successfully for payment ${paymentId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        message: `${documentType === 'invoice' ? 'Invoice' : 'Remittance advice'} uploaded successfully`
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
