import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRequestReceivedEmail {
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
    const { email, fullName, bookingId, location, startDate, duration }: BookingRequestReceivedEmail = await req.json();
    
    console.log('Sending booking request received email to:', email);
    
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "Your Booking Request Has Been Received",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Booking Request Received</title>
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
                        <h2 style="color: #333333;">Your Booking Request Has Been Received</h2>
                        <p style="font-size: 16px; color: #555555;">
                          Dear ${fullName},
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          Thank you for booking with ShazamParking.
                        </p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <h3 style="color: #333333; margin-top: 0;">Booking Details:</h3>
                          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                          <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
                          <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate}</p>
                          <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration}</p>
                        </div>
                        <p style="font-size: 16px; color: #555555;">
                          We've received your request and your payment card has been securely pre-authorized for the rental amount.
                          <strong>Please note that this is not yet a confirmation of your booking.</strong>
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          We are now contacting the space owner to verify availability. You will receive an update within 48 hours.
                        </p>
                        <ul style="font-size: 16px; color: #555555;">
                          <li>If the space is confirmed, your card will be charged and your booking finalized.</li>
                          <li>If it's no longer available, the pre-authorization will be released and no payment will be taken.</li>
                        </ul>
                        <p style="font-size: 16px; color: #555555;">
                          Thank you for choosing ShazamParking.
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

    console.log("Booking request received email sent successfully:", emailResponse);
    
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
    console.error("Error in send-booking-request-received function:", error);
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