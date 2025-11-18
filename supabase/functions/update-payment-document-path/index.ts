import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateRequest {
  paymentId: string;
  documentType: 'invoice' | 'remittance';
  filePath: string;
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

    const { paymentId, documentType, filePath }: UpdateRequest = await req.json();

    console.log('📝 Updating payment document path:', { paymentId, documentType, filePath });

    // Update payment record with file path
    const updateField = documentType === 'invoice' ? 'invoice_url' : 'remittance_advice_url';
    const { data: ownerPayment, error: updateError } = await supabaseClient
      .from("owner_payments")
      .update({ 
        [updateField]: filePath,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId)
      .select('booking_id')
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update payment record: ${updateError.message}`);
    }

    // If invoice uploaded, also update the customer's booking so they can download it
    if (documentType === 'invoice' && ownerPayment?.booking_id) {
      console.log(`🔗 Linking invoice to booking ${ownerPayment.booking_id} for customer access`);
      
      const { error: bookingUpdateError } = await supabaseClient
        .from("parking_bookings")
        .update({ 
          invoice_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq("id", ownerPayment.booking_id);

      if (bookingUpdateError) {
        console.error("Booking update error:", bookingUpdateError);
        // Don't fail the whole operation, just log it
      } else {
        console.log(`✅ Invoice successfully linked to booking ${ownerPayment.booking_id}`);
      }
    }

    console.log(`✅ ${documentType === 'invoice' ? 'Invoice' : 'Remittance'} path updated for payment ${paymentId}`);

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
