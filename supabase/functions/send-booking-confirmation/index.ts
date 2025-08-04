import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface BookingConfirmationRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending booking confirmation email...");

    const { bookingId, customerEmail, customerName }: BookingConfirmationRequest = await req.json();

    // Email 2a: Booking Confirmed
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [customerEmail],
      subject: "Your Booking is Confirmed",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Booking Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: #16a34a;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="Shazam Parking Logo" width="140" style="margin-bottom: 10px;" />
                        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333; margin-top: 0;">Dear ${customerName},</h2>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Good news! Your parking space booking has been confirmed.
                        </p>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Your card will now be charged for the pre-authorized amount and the space is reserved for you.
                        </p>
                        
                        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                          <h3 style="color: #16a34a; margin-top: 0;">Booking Reference: ${bookingId}</h3>
                          <p style="color: #333; margin: 0;">Your parking space is now confirmed and ready for your use.</p>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          To contact the space owner or manage your booking, please log in to your account and visit the Messages section.
                        </p>
                        
                        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                          <a href="https://www.shazamparking.ae/my-account" style="background-color: #0099cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Your Booking</a>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          If you have any questions, we're here to help — just reply to this email.
                        </p>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Best regards,<br>
                          The ShazamParking Team<br>
                          <a href="mailto:support@shazamparking.ae" style="color: #0099cc;">support@shazamparking.ae</a><br>
                          <a href="https://www.shazamparking.ae" style="color: #0099cc;">www.shazamparking.ae</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Confirmation email error:", emailResponse.error);
      throw new Error(`Failed to send confirmation email: ${emailResponse.error.message}`);
    }

    console.log("Booking confirmation email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Booking confirmation email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);