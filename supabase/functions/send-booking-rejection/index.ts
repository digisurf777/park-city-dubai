import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface BookingRejectionRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  reason?: string;
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
    console.log("Sending booking rejection email...");

    const { bookingId, customerEmail, customerName, reason }: BookingRejectionRequest = await req.json();

    // Email 2b: Booking Rejected
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [customerEmail],
      subject: "Unfortunately, Your Booking Could Not Be Confirmed",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Booking Could Not Be Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: #dc2626;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="Shazam Parking Logo" width="140" style="margin-bottom: 10px;" />
                        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Update</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333; margin-top: 0;">Dear ${customerName},</h2>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Unfortunately, the space you selected is no longer available.
                        </p>
                        
                        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                          <h3 style="color: #dc2626; margin-top: 0;">Booking Reference: ${bookingId}</h3>
                          <p style="color: #333; margin: 0;">
                            Your booking request has been cancelled and no charges have been made. The card pre-authorization has now been released.
                          </p>
                          ${reason ? `<p style="color: #333; margin: 10px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          We're sorry for the inconvenience and appreciate your understanding.
                          To view other available spaces, please visit <a href="https://www.shazamparking.ae" style="color: #0099cc;">www.shazamparking.ae</a>.
                        </p>
                        
                        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                          <h3 style="color: #0099cc; margin-top: 0;">Find Alternative Parking</h3>
                          <a href="https://www.shazamparking.ae/find-parking" style="background-color: #0099cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Browse Available Spaces</a>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          If you need help finding a suitable alternative, feel free to contact us anytime.
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
      console.error("Rejection email error:", emailResponse.error);
      throw new Error(`Failed to send rejection email: ${emailResponse.error.message}`);
    }

    console.log("Booking rejection email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Booking rejection email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-booking-rejection:", error);
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