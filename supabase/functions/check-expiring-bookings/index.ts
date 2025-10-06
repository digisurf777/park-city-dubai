import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting expiring bookings check...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find bookings that expire in exactly 2 days (48 hours +/- 6 hours window)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setHours(twoDaysFromNow.getHours() + 48);
    
    const windowStart = new Date(twoDaysFromNow);
    windowStart.setHours(windowStart.getHours() - 6); // 42 hours from now
    
    const windowEnd = new Date(twoDaysFromNow);
    windowEnd.setHours(windowEnd.getHours() + 6); // 54 hours from now

    console.log(`Checking for bookings expiring between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

    // Fetch expiring bookings
    const { data: expiringBookings, error: fetchError } = await supabaseClient
      .from("parking_bookings")
      .select(`
        id,
        user_id,
        location,
        zone,
        start_time,
        end_time,
        cost_aed,
        status
      `)
      .gte("end_time", windowStart.toISOString())
      .lte("end_time", windowEnd.toISOString())
      .in("status", ["confirmed", "approved"]);

    if (fetchError) {
      console.error("Error fetching expiring bookings:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringBookings?.length || 0} expiring bookings`);

    if (!expiringBookings || expiringBookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expiring bookings found",
          count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create notifications for each user
    const userNotifications = expiringBookings.map((booking) => ({
      user_id: booking.user_id,
      notification_type: "booking_expiring",
      title: "Parking Booking Expires Soon",
      message: `Your parking booking at ${booking.location} (${booking.zone}) will expire in 2 days on ${new Date(booking.end_time).toLocaleDateString()}. Please make arrangements if you need to extend your booking.`,
      booking_id: booking.id,
    }));

    // Insert user notifications
    const { error: notificationError } = await supabaseClient
      .from("user_notifications")
      .insert(userNotifications);

    if (notificationError) {
      console.error("Error creating user notifications:", notificationError);
    } else {
      console.log(`Created ${userNotifications.length} user notifications`);
    }

    // Create admin notification summarizing all expiring bookings
    const adminSummary = expiringBookings
      .map(
        (b) =>
          `• ${b.location} (${b.zone}) - User ID: ${b.user_id.substring(0, 8)}... - Expires: ${new Date(b.end_time).toLocaleString()}`
      )
      .join("\n");

    const { error: adminNotificationError } = await supabaseClient
      .from("admin_notifications")
      .insert({
        notification_type: "bookings_expiring",
        title: `${expiringBookings.length} Parking Booking(s) Expiring in 2 Days`,
        message: `The following bookings will expire in approximately 2 days:\n\n${adminSummary}`,
        priority: "normal",
      });

    if (adminNotificationError) {
      console.error("Error creating admin notification:", adminNotificationError);
    } else {
      console.log("Created admin notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expiring booking notifications created successfully",
        count: expiringBookings.length,
        bookings: expiringBookings.map((b) => ({
          id: b.id,
          location: b.location,
          end_time: b.end_time,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-expiring-bookings:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
