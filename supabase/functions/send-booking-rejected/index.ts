import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRejectedEmail {
  email: string;
  fullName: string;
  bookingId: string;
  location: string;
  startDate: string;
  duration: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, bookingId, location, startDate, duration }: BookingRejectedEmail = await req.json();
    
    console.log('Sending booking rejected email to:', email);
    
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
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
                      <td style="padding: 20px; text-align: center; background-color: #0099cc;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="ShazamParking Logo" width="140" style="margin-bottom: 10px;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333;">Unfortunately, Your Booking Could Not Be Confirmed</h2>
                        <p style="font-size: 16px; color: #555555;">
                          Dear ${fullName},
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          Unfortunately, the space you selected is no longer available.
                        </p>
                        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                          <h3 style="color: #333333; margin-top: 0;">Cancelled Booking Details:</h3>
                          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                          <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
                          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate}</p>
                          <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration}</p>
                        </div>
                        <p style="font-size: 16px; color: #555555;">
                          <strong>Your booking request has been cancelled and no charges have been made.</strong> The card pre-authorization has now been released.
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          We're sorry for the inconvenience and appreciate your understanding.
                          To view other available spaces, please visit www.shazamparking.ae.
                        </p>
                        <p style="text-align: center; margin: 30px 0;">
                          <a href="https://www.shazamparking.ae/find-parking" target="_blank" style="background-color: #0099cc; color: #ffffff; text-decoration: none; padding: 14px 26px; border-radius: 6px; font-weight: bold;">
                            Find Alternative Parking
                          </a>
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          If you need help finding a suitable alternative, feel free to contact us anytime.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; text-align: center; font-size: 12px; color: #999999;">
                        Best regards,<br />
                        The ShazamParking Team<br />
                        <a href="mailto:support@shazamparking.ae">support@shazamparking.ae</a><br />
                        <a href="https://www.shazamparking.ae">www.shazamparking.ae</a>
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

    console.log("Booking rejected email sent successfully:", emailResponse);
    
    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-rejected function:", error);
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