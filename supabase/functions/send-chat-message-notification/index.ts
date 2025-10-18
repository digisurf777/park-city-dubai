import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  booking_id: string;
  driver_id: string;
  owner_id: string;
  driver_email: string;
  owner_email: string;
  first_unread_message_at: string;
  recipient_is_driver: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔔 Chat notification check started");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get chats needing notification
    const { data: chatsNeedingNotification, error: fetchError } = await supabase
      .rpc("get_chats_needing_notification");

    if (fetchError) {
      console.error("❌ Error fetching chats:", fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${chatsNeedingNotification?.length || 0} chats needing notification`);

    if (!chatsNeedingNotification || chatsNeedingNotification.length === 0) {
      return new Response(
        JSON.stringify({ message: "No notifications to send", count: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results = [];

    // Process each chat that needs notification
    for (const chat of chatsNeedingNotification as NotificationData[]) {
      console.log(`📧 Processing notification for booking ${chat.booking_id}`);
      
      // Determine recipient based on who sent the last message
      const recipientEmail = chat.recipient_is_driver ? chat.owner_email : chat.driver_email;
      const recipientRole = chat.recipient_is_driver ? "Owner" : "Driver";

      if (!recipientEmail) {
        console.error(`❌ No email found for ${recipientRole} in booking ${chat.booking_id}`);
        results.push({
          booking_id: chat.booking_id,
          success: false,
          error: "No recipient email",
        });
        continue;
      }

      try {
        // Send email notification
        console.log(`📤 Sending email to ${recipientEmail}`);
        await resend.emails.send({
          from: "Shazam Parking <support@shazamparking.ae>",
          to: [recipientEmail],
          subject: "You have a new message",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Message Notification</h2>
              <p>You have received a new message in your parking booking chat.</p>
              <p>Please log in to your account to view and respond to the message.</p>
              <a href="https://shazamparking.ae/my-account" 
                 style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                View Message
              </a>
              <p style="margin-top: 24px; color: #666; font-size: 14px;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>
          `,
        });

        console.log(`✅ Email sent successfully to ${recipientEmail}`);

        // Update notification state in database
        const { error: updateError } = await supabase
          .from("chat_notification_state")
          .update({
            last_notification_sent_at: new Date().toISOString(),
            notification_cooldown_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes cooldown
            notification_timer_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", chat.booking_id);

        if (updateError) {
          console.error(`❌ Error updating notification state:`, updateError);
        } else {
          console.log(`✅ Notification state updated for booking ${chat.booking_id}`);
        }

        results.push({
          booking_id: chat.booking_id,
          success: true,
          recipient: recipientEmail,
        });
      } catch (emailError) {
        console.error(`❌ Error sending email for booking ${chat.booking_id}:`, emailError);
        results.push({
          booking_id: chat.booking_id,
          success: false,
          error: emailError.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`✅ Notification check complete: ${successCount}/${results.length} sent successfully`);

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount} notifications`,
        total: results.length,
        successful: successCount,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-chat-message-notification:", error);
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
