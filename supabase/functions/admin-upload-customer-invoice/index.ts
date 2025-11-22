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

    console.log('📤 Admin uploading customer invoice:', { bookingId, customerUserId, fileName });

    // Verify the booking exists (admin can upload for any customer)
    const { data: booking, error: bookingError } = await supabaseClient
      .from("parking_bookings")
      .select("id, user_id, location, zone")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking lookup error:", bookingError);
      throw new Error("Booking not found");
    }

    // Verify the customerUserId matches the booking's user_id for data consistency
    if (booking.user_id !== customerUserId) {
      console.error("User ID mismatch:", { 
        booking_user_id: booking.user_id, 
        provided_user_id: customerUserId 
      });
      throw new Error("Customer user ID does not match booking");
    }

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Verify it's a PDF
    const pdfHeader = new Uint8Array(fileBuffer.slice(0, 5));
    const pdfSignature = String.fromCharCode(...pdfHeader);
    if (!pdfSignature.startsWith('%PDF-')) {
      throw new Error("Invalid PDF file");
    }

    // Get current invoice count for this booking
    const { count, error: countError } = await supabaseClient
      .from("booking_invoices")
      .select("*", { count: 'exact', head: true })
      .eq("booking_id", bookingId);

    if (countError) {
      console.error("Count error:", countError);
      throw new Error(`Failed to count invoices: ${countError.message}`);
    }

    const invoiceNumber = (count || 0) + 1;

    // Upload to storage with timestamp to avoid conflicts
    // Use customerUserId as folder name to match RLS policy
    const timestamp = Date.now();
    const filePath = `${customerUserId}/booking_${bookingId}_invoice_${invoiceNumber}_${timestamp}.pdf`;
    
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

    // Insert into booking_invoices table
    const { error: insertError } = await supabaseClient
      .from("booking_invoices")
      .insert({
        booking_id: bookingId,
        invoice_number: invoiceNumber,
        file_path: filePath,
        file_name: fileName,
        uploaded_by: user.id,
        file_size_bytes: fileBuffer.length
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save invoice record: ${insertError.message}`);
    }

    // Also update parking_bookings.invoice_url for backward compatibility
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

    console.log(`✅ Admin ${user.email} uploaded custom invoice #${invoiceNumber} for booking ${bookingId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        invoiceNumber,
        message: `Invoice #${invoiceNumber} uploaded successfully`
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
