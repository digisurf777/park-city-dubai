import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadRequest {
  bookingId: string;
  invoiceFilePath: string;
  invoiceNumber: number;
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

    const { bookingId, invoiceFilePath, invoiceNumber }: DownloadRequest = await req.json();

    console.log('📥 Download request:', { bookingId, invoiceFilePath, invoiceNumber, userId: user.id });

    // Get booking to verify access
    const { data: booking, error: bookingError } = await supabaseClient
      .from("parking_bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Check if user is admin or booking owner
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    
    const isAdmin = !!roleData;
    const isOwner = booking.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Access denied");
    }

    // Generate signed URL using service role (bypasses RLS)
    const { data: urlData, error: urlError } = await supabaseClient.storage
      .from("booking-invoices")
      .createSignedUrl(invoiceFilePath, 900, { 
        download: `invoice_${invoiceNumber}_${bookingId.slice(0, 8)}.pdf`
      });

    if (urlError) {
      console.error("URL generation error:", urlError);
      throw new Error(`Failed to generate download URL: ${urlError.message}`);
    }

    console.log('✅ Download URL generated successfully');

    return new Response(
      JSON.stringify({ 
        url: urlData.signedUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
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
