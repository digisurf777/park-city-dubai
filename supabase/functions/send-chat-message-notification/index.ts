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
  sender_name: string;
  latest_message_preview: string;
  booking_location: string;
  booking_zone: string;
  recipient_name: string;
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
      console.log(`   First unread at: ${chat.first_unread_message_at}`);
      console.log(`   Recipient is ${chat.recipient_is_driver ? 'driver' : 'owner'}`);
      
      // Determine recipient based on who sent the last message
      const recipientEmail = chat.recipient_is_driver ? chat.driver_email : chat.owner_email;
      const recipientRole = chat.recipient_is_driver ? "Driver" : "Owner";

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
        // Construct direct chat link
        const chatLink = `https://shazamparking.ae/my-account?openChat=${chat.booking_id}`;
        
        // Truncate message preview if needed
        const messagePreview = chat.latest_message_preview.length > 100 
          ? chat.latest_message_preview.substring(0, 97) + '...'
          : chat.latest_message_preview;

        // Send email notification
        console.log(`📤 Sending email to ${recipientEmail}`);
        console.log(`   From: ${chat.sender_name}`);
        console.log(`   Preview: ${messagePreview}`);
        
        await resend.emails.send({
          from: "Shazam Parking <support@shazamparking.ae>",
          to: [recipientEmail],
          bcc: ["support@shazamparking.ae"],
          subject: `New message from ${chat.sender_name} - Shazam Parking`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px;">
                  <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600;">New Message</h1>
                </div>

                <!-- Greeting -->
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                  Hi ${chat.recipient_name},
                </p>

                <!-- Message Info -->
                <div style="background-color: #f3f4f6; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                  <p style="color: #111827; margin: 0 0 8px 0; font-weight: 600;">
                    From: ${chat.sender_name}
                  </p>
                  <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px;">
                    Regarding: ${chat.booking_location}${chat.booking_zone ? `, ${chat.booking_zone}` : ''}
                  </p>
                  <p style="color: #4b5563; margin: 0; font-size: 14px; font-style: italic; line-height: 1.5;">
                    "${messagePreview}"
                  </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${chatLink}" 
                     style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                    View and Reply
                  </a>
                </div>

                <!-- Additional Info -->
                <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0; line-height: 1.6;">
                  Click the button above to open your chat and respond to this message. You can view all your active booking conversations in your account dashboard.
                </p>

                <!-- Footer -->
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated notification from Shazam Parking. Please do not reply to this email directly. If you have any questions, please contact us through your account dashboard.
                  </p>
                </div>
              </div>

              <!-- Brand Footer -->
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © 2025 Shazam Parking. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });

        console.log(`✅ Email sent successfully to ${recipientEmail}`);

        // Get current notification count to increment
        const { data: currentState } = await supabase
          .from("chat_notification_state")
          .select("notification_count")
          .eq("booking_id", chat.booking_id)
          .single();

        const currentCount = currentState?.notification_count || 0;
        const newCount = currentCount + 1;

        // Update notification state in database
        const { error: updateError } = await supabase
          .from("chat_notification_state")
          .update({
            last_notification_sent_at: new Date().toISOString(),
            notification_cooldown_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes cooldown
            notification_timer_active: newCount < 3, // Keep timer active only for first 3 notifications
            notification_count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", chat.booking_id);

        if (updateError) {
          console.error(`❌ Error updating notification state:`, updateError);
        } else {
          console.log(`✅ Notification state updated for booking ${chat.booking_id} (count: ${newCount})`);
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
