import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  bookingId: string;
  customerUserId: string;
  fileName: string;
  fileData: string; // base64 encoded PDF
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

    const { bookingId, customerUserId, fileName, fileData }: UploadRequest = await req.json();

    // Verify booking exists and belongs to the customer
    const { data: booking, error: bookingError } = await supabaseClient
      .from("parking_bookings")
      .select("id, user_id, location, zone")
      .eq("id", bookingId)
      .eq("user_id", customerUserId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or does not belong to this customer");
    }

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Verify it's a PDF
    const pdfHeader = new Uint8Array(fileBuffer.slice(0, 5));
    const pdfSignature = String.fromCharCode(...pdfHeader);
    if (!pdfSignature.startsWith('%PDF-')) {
      throw new Error("Invalid PDF file");
    }

    // Upload to storage with timestamp to avoid conflicts
    const timestamp = Date.now();
    const filePath = `${bookingId}/admin_invoice_${timestamp}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("booking-invoices")
      .upload(filePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload invoice: ${uploadError.message}`);
    }

    // Update booking record with new invoice URL
    const { error: updateError } = await supabaseClient
      .from("parking_bookings")
      .update({ 
        invoice_url: filePath,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log(`Admin ${user.email} uploaded custom invoice for booking ${bookingId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        message: "Customer invoice uploaded successfully"
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
