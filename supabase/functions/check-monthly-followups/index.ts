import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔍 Checking for bookings needing 30-day follow-up...");

    // Find confirmed bookings where:
    // 1. Start date was 30 days ago (within a 1-day window)
    // 2. monthly_followup_sent is false or null
    // 3. Booking is still active (end_time is in the future)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startOfDay = new Date(thirtyDaysAgo);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(thirtyDaysAgo);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date().toISOString();

    const { data: bookings, error: bookingsError } = await supabase
      .from("parking_bookings")
      .select(`
        id,
        user_id,
        listing_id,
        location,
        zone,
        start_time,
        end_time,
        cost_aed,
        status
      `)
      .eq("status", "confirmed")
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .gt("end_time", now)
      .or("monthly_followup_sent.is.null,monthly_followup_sent.eq.false");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} bookings needing follow-up`);

    const results = [];

    for (const booking of bookings || []) {
      try {
        // Get driver profile
        const { data: driverProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", booking.user_id)
          .single();

        if (!driverProfile?.email) {
          console.warn(`No email found for driver ${booking.user_id}`);
          continue;
        }

        // Get owner info from listing
        let ownerEmail = null;
        let ownerName = null;
        
        if (booking.listing_id) {
          const { data: listing } = await supabase
            .from("parking_listings")
            .select("owner_id")
            .eq("id", booking.listing_id)
            .single();

          if (listing?.owner_id) {
            const { data: ownerProfile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("user_id", listing.owner_id)
              .single();

            if (ownerProfile) {
              ownerEmail = ownerProfile.email;
              ownerName = ownerProfile.full_name;
            }
          }
        }

        // Send the follow-up email
        const { error: emailError } = await supabase.functions.invoke("send-monthly-followup", {
          body: {
            userEmail: driverProfile.email,
            userName: driverProfile.full_name || "Customer",
            ownerEmail,
            ownerName,
            bookingDetails: {
              location: booking.location,
              startDate: new Date(booking.start_time).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
              }),
              endDate: new Date(booking.end_time).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
              }),
              amount: `${booking.cost_aed} AED`
            }
          }
        });

        if (emailError) {
          console.error(`Failed to send follow-up for booking ${booking.id}:`, emailError);
          results.push({ bookingId: booking.id, success: false, error: emailError.message });
          continue;
        }

        // Mark as sent
        const { error: updateError } = await supabase
          .from("parking_bookings")
          .update({ monthly_followup_sent: true })
          .eq("id", booking.id);

        if (updateError) {
          console.warn(`Failed to mark follow-up as sent for ${booking.id}:`, updateError);
        }

        console.log(`✅ Sent 30-day follow-up for booking ${booking.id}`);
        results.push({ bookingId: booking.id, success: true });

      } catch (bookingError) {
        console.error(`Error processing booking ${booking.id}:`, bookingError);
        results.push({ bookingId: booking.id, success: false, error: String(bookingError) });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: results.length,
      results 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in check-monthly-followups function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
