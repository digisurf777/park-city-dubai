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
    
    // Get all active confirmed bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("parking_bookings")
      .select(`
        id,
        user_id,
        location,
        start_time,
        end_time,
        monthly_followup_sent_at
      `)
      .in("status", ["confirmed", "approved"])
      .gt("end_time", now.toISOString());

    if (bookingsError) {
      console.error("Error fetching active bookings:", bookingsError);
      errors.push(`Booking fetch error: ${bookingsError.message}`);
    } else if (activeBookings && activeBookings.length > 0) {
      console.log(`Found ${activeBookings.length} active bookings to check`);
      
      // Filter bookings that should receive an email today
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
        
        // Check if email was already sent this month
        if (wasEmailSentThisMonth(booking.monthly_followup_sent_at, now)) {
          console.log(`Booking ${booking.id}: Email already sent this month on ${booking.monthly_followup_sent_at}, skipping`);
          return false;
        }
        
        console.log(`Booking ${booking.id}: Due for anniversary email (started ${startDate.toISOString()}, day ${startDay})`);
        return true;
      });
      
      console.log(`${bookingsToEmail.length} bookings qualify for anniversary emails today`);
      
      // Get unique user IDs from filtered bookings
      const uniqueUserIds = [...new Set(bookingsToEmail.map(b => b.user_id))];
      
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
            console.log(`Driver anniversary check-in email sent to ${email}`);
            driverEmailsSent++;
            
            // Update all qualifying bookings for this user with the sent timestamp
            const userBookingIds = bookingsToEmail
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
      console.log("No active bookings found");
    }

    // ===== OWNER PAYOUT NOTIFICATION EMAILS =====
    // (This logic remains the same - sent when payout is completed, not anniversary-based)
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
