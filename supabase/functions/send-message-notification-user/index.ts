import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationEmail {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: MessageNotificationEmail = await req.json();
    
    console.log('Sending message notification email to:', email);
    
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "You Have a New Message on ShazamParking",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>New Message Notification</title>
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
                        <h2 style="color: #333333;">You Have a New Message on ShazamParking</h2>
                        <p style="font-size: 16px; color: #555555;">
                          Dear ${fullName},
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          You've received a new message on your ShazamParking account.
                        </p>
                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0099cc;">
                          <p style="margin: 0; font-size: 16px; color: #555555;">
                            To view and reply, please log in and visit the Messages section.
                          </p>
                        </div>
                        <p style="text-align: center; margin: 30px 0;">
                          <a href="https://www.shazamparking.ae/my-account" target="_blank" style="background-color: #0099cc; color: #ffffff; text-decoration: none; padding: 14px 26px; border-radius: 6px; font-weight: bold;">
                            View Messages
                          </a>
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          We recommend checking your messages regularly to stay up to date.
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          If you have any questions, we're here to help.
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

    console.log("Message notification email sent successfully:", emailResponse);
    
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
    console.error("Error in send-message-notification-user function:", error);
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