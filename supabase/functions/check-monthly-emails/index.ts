import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://eoknluyunximjlsnyceb.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

/**
 * Get the day of month, handling edge cases for months with fewer days.
 * If the booking started on the 31st and current month has 30 days,
 * use the last day of the month instead.
 */
function getEffectiveDay(startDay: number, currentMonth: number, currentYear: number): number {
  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // If the start day is greater than the last day of current month,
  // use the last day of the month
  if (startDay > lastDayOfMonth) {
    return lastDayOfMonth;
  }
  
  return startDay;
}

/**
 * Check if at least one full month has passed since the start date.
 */
function hasOneMonthPassed(startDate: Date, currentDate: Date): boolean {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Calculate months difference
  const monthsDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
  return monthsDiff >= 1;
}

/**
 * Check if an email was already sent this calendar month.
 */
function wasEmailSentThisMonth(lastSentAt: string | null, currentDate: Date): boolean {
  if (!lastSentAt) return false;
  
  const lastSent = new Date(lastSentAt);
  return lastSent.getFullYear() === currentDate.getFullYear() &&
         lastSent.getMonth() === currentDate.getMonth();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("check-monthly-emails function called at:", new Date().toISOString());

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date();
    const todayDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    console.log(`Running anniversary-based monthly check. Today is day ${todayDay} of month ${currentMonth + 1}/${currentYear}`);
    
    let driverEmailsSent = 0;
    let ownerEmailsSent = 0;
    const errors: string[] = [];

    // ===== DRIVER MONTHLY CHECK-IN EMAILS (Anniversary Based) =====
    console.log("Checking for driver monthly check-in emails (anniversary-based)...");
    
    // Get all active confirmed bookings with listing info for owner
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("parking_bookings")
      .select(`
        id,
        user_id,
        listing_id,
        location,
        start_time,
        end_time,
        monthly_followup_sent_at,
        payout_email_sent_at
      `)
      .in("status", ["confirmed", "approved"])
      .gt("end_time", now.toISOString());

    if (bookingsError) {
      console.error("Error fetching active bookings:", bookingsError);
      errors.push(`Booking fetch error: ${bookingsError.message}`);
    } else if (activeBookings && activeBookings.length > 0) {
      console.log(`Found ${activeBookings.length} active bookings to check`);
      
      // Filter bookings that should receive an email today (anniversary check)
      const bookingsToEmail = activeBookings.filter(booking => {
        const startDate = new Date(booking.start_time);
        const startDay = startDate.getDate();
        
        // Get the effective day for this month (handles 31st in Feb, etc.)
        const effectiveDay = getEffectiveDay(startDay, currentMonth, currentYear);
        
        // Check if today is the anniversary day
        if (todayDay !== effectiveDay) {
          return false;
        }
        
        // Check if at least one month has passed since booking started
        if (!hasOneMonthPassed(startDate, now)) {
          console.log(`Booking ${booking.id}: Started on ${startDate.toISOString()}, less than 1 month ago, skipping`);
          return false;
        }
        
        // Check if BOTH driver and owner emails were already sent this month
        const driverEmailSent = wasEmailSentThisMonth(booking.monthly_followup_sent_at, now);
        const ownerEmailSent = wasEmailSentThisMonth(booking.payout_email_sent_at, now);
        
        if (driverEmailSent && ownerEmailSent) {
          console.log(`Booking ${booking.id}: Both emails already sent this month, skipping`);
          return false;
        }
        
        console.log(`Booking ${booking.id}: Due for anniversary email (started ${startDate.toISOString()}, day ${startDay})`);
        return true;
      });
      
      console.log(`${bookingsToEmail.length} bookings qualify for anniversary emails today`);
      
      // Process each qualifying booking
      for (const booking of bookingsToEmail) {
        const driverEmailAlreadySent = wasEmailSentThisMonth(booking.monthly_followup_sent_at, now);
        const ownerEmailAlreadySent = wasEmailSentThisMonth(booking.payout_email_sent_at, now);
        
        // ===== SEND DRIVER EMAIL =====
        if (!driverEmailAlreadySent) {
          try {
            const { data: userInfo, error: userError } = await supabase
              .rpc("get_user_email_and_name", { user_uuid: booking.user_id });

            if (userError || !userInfo || userInfo.length === 0) {
              console.error(`Error getting user info for ${booking.user_id}:`, userError);
              errors.push(`User info error for ${booking.user_id}: ${userError?.message || 'No data'}`);
            } else {
              const { email, full_name } = userInfo[0];
              if (email) {
                const firstName = full_name?.split(" ")[0] || "Valued Customer";

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
                  console.log(`Driver anniversary check-in email sent to ${email} for booking ${booking.id}`);
                  driverEmailsSent++;
                  
                  const { error: updateError } = await supabase
                    .from("parking_bookings")
                    .update({ monthly_followup_sent_at: now.toISOString() })
                    .eq("id", booking.id);

                  if (updateError) {
                    console.error(`Error updating driver followup timestamp:`, updateError);
                    errors.push(`Driver update error: ${updateError.message}`);
                  }
                } else {
                  const errorText = await emailResponse.text();
                  console.error(`Failed to send driver email to ${email}:`, errorText);
                  errors.push(`Driver email failed for ${email}: ${errorText}`);
                }
              }
            }
          } catch (err: any) {
            console.error(`Error processing driver for booking ${booking.id}:`, err);
            errors.push(`Driver processing error: ${err.message}`);
          }
        }
        
        // ===== SEND OWNER EMAIL =====
        if (!ownerEmailAlreadySent && booking.listing_id) {
          try {
            // Get owner_id from the listing
            const { data: listing, error: listingError } = await supabase
              .from("parking_listings")
              .select("owner_id")
              .eq("id", booking.listing_id)
              .single();

            if (listingError || !listing?.owner_id) {
              console.error(`Error getting listing/owner for booking ${booking.id}:`, listingError);
              errors.push(`Listing error for booking ${booking.id}: ${listingError?.message || 'No owner'}`);
            } else {
              const { data: ownerInfo, error: ownerError } = await supabase
                .rpc("get_user_email_and_name", { user_uuid: listing.owner_id });

              if (ownerError || !ownerInfo || ownerInfo.length === 0) {
                console.error(`Error getting owner info for ${listing.owner_id}:`, ownerError);
                errors.push(`Owner info error for ${listing.owner_id}: ${ownerError?.message || 'No data'}`);
              } else {
                const { email, full_name } = ownerInfo[0];
                if (email) {
                  const firstName = full_name?.split(" ")[0] || "Valued Partner";

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
                    console.log(`Owner payout notification email sent to ${email} for booking ${booking.id}`);
                    ownerEmailsSent++;
                    
                    const { error: updateError } = await supabase
                      .from("parking_bookings")
                      .update({ payout_email_sent_at: now.toISOString() })
                      .eq("id", booking.id);

                    if (updateError) {
                      console.error(`Error updating owner payout email timestamp:`, updateError);
                      errors.push(`Owner update error: ${updateError.message}`);
                    }
                  } else {
                    const errorText = await emailResponse.text();
                    console.error(`Failed to send owner email to ${email}:`, errorText);
                    errors.push(`Owner email failed for ${email}: ${errorText}`);
                  }
                }
              }
            }
          } catch (err: any) {
            console.error(`Error processing owner for booking ${booking.id}:`, err);
            errors.push(`Owner processing error: ${err.message}`);
          }
        }
      }
    } else {
      console.log("No active bookings found");
    }

    // Summary
    const summary = {
      success: true,
      timestamp: now.toISOString(),
      todayDay,
      driverEmailsSent,
      ownerEmailsSent,
      totalEmailsSent: driverEmailsSent + ownerEmailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Anniversary-based monthly email check completed:", summary);

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
