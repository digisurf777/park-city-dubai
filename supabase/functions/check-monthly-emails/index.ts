import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://eoknluyunximjlsnyceb.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const handler = async (req: Request): Promise<Response> => {
  console.log("check-monthly-emails function called at:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    let driverEmailsSent = 0;
    let ownerEmailsSent = 0;
    const errors: string[] = [];

    // ===== DRIVER MONTHLY CHECK-IN EMAILS =====
    console.log("Checking for driver monthly check-in emails...");
    
    // Get active confirmed bookings that haven't received this month's follow-up
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("parking_bookings")
      .select(`
        id,
        user_id,
        location,
        monthly_followup_sent_at
      `)
      .in("status", ["confirmed", "approved"])
      .gt("end_time", now.toISOString())
      .or(`monthly_followup_sent_at.is.null,monthly_followup_sent_at.lt.${startOfMonth.toISOString()}`);

    if (bookingsError) {
      console.error("Error fetching active bookings:", bookingsError);
      errors.push(`Booking fetch error: ${bookingsError.message}`);
    } else if (activeBookings && activeBookings.length > 0) {
      console.log(`Found ${activeBookings.length} bookings needing driver follow-up emails`);
      
      // Get unique user IDs
      const uniqueUserIds = [...new Set(activeBookings.map(b => b.user_id))];
      
      for (const userId of uniqueUserIds) {
        try {
          // Get user info using the database function
          const { data: userInfo, error: userError } = await supabase
            .rpc("get_user_email_and_name", { user_uuid: userId });

          if (userError || !userInfo || userInfo.length === 0) {
            console.error(`Error getting user info for ${userId}:`, userError);
            errors.push(`User info error for ${userId}: ${userError?.message || 'No data'}`);
            continue;
          }

          const { email, full_name } = userInfo[0];
          if (!email) {
            console.log(`No email found for user ${userId}, skipping`);
            continue;
          }

          // Extract first name
          const firstName = full_name?.split(" ")[0] || "Valued Customer";

          // Send driver check-in email
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-driver-monthly-checkin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              driverEmail: email,
              driverFirstName: firstName,
            }),
          });

          if (emailResponse.ok) {
            console.log(`Driver check-in email sent to ${email}`);
            driverEmailsSent++;
            
            // Update all bookings for this user with the sent timestamp
            const userBookingIds = activeBookings
              .filter(b => b.user_id === userId)
              .map(b => b.id);
            
            const { error: updateError } = await supabase
              .from("parking_bookings")
              .update({ monthly_followup_sent_at: now.toISOString() })
              .in("id", userBookingIds);

            if (updateError) {
              console.error(`Error updating followup timestamp:`, updateError);
              errors.push(`Update error: ${updateError.message}`);
            }
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send driver email to ${email}:`, errorText);
            errors.push(`Driver email failed for ${email}: ${errorText}`);
          }
        } catch (err: any) {
          console.error(`Error processing driver ${userId}:`, err);
          errors.push(`Driver processing error: ${err.message}`);
        }
      }
    } else {
      console.log("No active bookings requiring driver follow-up emails");
    }

    // ===== OWNER PAYOUT NOTIFICATION EMAILS =====
    console.log("Checking for owner payout notification emails...");
    
    // Get completed payments that haven't had payout email sent
    const { data: pendingPayouts, error: payoutsError } = await supabase
      .from("owner_payments")
      .select(`
        id,
        owner_id,
        amount,
        payout_email_sent
      `)
      .eq("status", "completed")
      .eq("payout_email_sent", false);

    if (payoutsError) {
      console.error("Error fetching pending payouts:", payoutsError);
      errors.push(`Payout fetch error: ${payoutsError.message}`);
    } else if (pendingPayouts && pendingPayouts.length > 0) {
      console.log(`Found ${pendingPayouts.length} payouts needing owner notification emails`);
      
      // Get unique owner IDs
      const uniqueOwnerIds = [...new Set(pendingPayouts.map(p => p.owner_id))];
      
      for (const ownerId of uniqueOwnerIds) {
        try {
          // Get owner info using the database function
          const { data: ownerInfo, error: ownerError } = await supabase
            .rpc("get_user_email_and_name", { user_uuid: ownerId });

          if (ownerError || !ownerInfo || ownerInfo.length === 0) {
            console.error(`Error getting owner info for ${ownerId}:`, ownerError);
            errors.push(`Owner info error for ${ownerId}: ${ownerError?.message || 'No data'}`);
            continue;
          }

          const { email, full_name } = ownerInfo[0];
          if (!email) {
            console.log(`No email found for owner ${ownerId}, skipping`);
            continue;
          }

          // Extract first name
          const firstName = full_name?.split(" ")[0] || "Valued Partner";

          // Send owner payout notification email
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-owner-payout-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              ownerEmail: email,
              ownerFirstName: firstName,
            }),
          });

          if (emailResponse.ok) {
            console.log(`Owner payout notification email sent to ${email}`);
            ownerEmailsSent++;
            
            // Update all payments for this owner with the sent timestamp
            const ownerPaymentIds = pendingPayouts
              .filter(p => p.owner_id === ownerId)
              .map(p => p.id);
            
            const { error: updateError } = await supabase
              .from("owner_payments")
              .update({ 
                payout_email_sent: true,
                payout_email_sent_at: now.toISOString()
              })
              .in("id", ownerPaymentIds);

            if (updateError) {
              console.error(`Error updating payout email status:`, updateError);
              errors.push(`Payout update error: ${updateError.message}`);
            }
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send owner email to ${email}:`, errorText);
            errors.push(`Owner email failed for ${email}: ${errorText}`);
          }
        } catch (err: any) {
          console.error(`Error processing owner ${ownerId}:`, err);
          errors.push(`Owner processing error: ${err.message}`);
        }
      }
    } else {
      console.log("No pending payouts requiring owner notification emails");
    }

    // Summary
    const summary = {
      success: true,
      timestamp: now.toISOString(),
      driverEmailsSent,
      ownerEmailsSent,
      totalEmailsSent: driverEmailsSent + ownerEmailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Monthly email check completed:", summary);

    return new Response(
      JSON.stringify(summary),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-monthly-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
