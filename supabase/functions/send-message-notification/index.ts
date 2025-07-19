import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, subject, message }: MessageNotificationRequest = await req.json();

    console.log('Sending message notification to:', userEmail);
    console.log('Subject:', subject);
    console.log('Message preview:', message.substring(0, 100));

    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <verify@shazam.ae>",
      to: ["digisurf777@gmail.com"], // Using your verified email for testing
      subject: `Message from Shazam Parking Admin: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>New Message from Admin</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0099cc; padding: 20px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Message from Shazam Parking</h1>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #0099cc; margin-top: 0;">Hello ${userName}!</h2>
              <p><strong>Customer Email:</strong> ${userEmail}</p>
              <p>You have received a new message from the Shazam Parking administration team.</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #0099cc; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0099cc;">Subject: ${subject}</h3>
                <div style="white-space: pre-wrap;">${message}</div>
              </div>
              
              <p>Please log in to your Shazam Parking account to view this message and respond if needed.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://shazamparking.ae/my-account" style="background-color: #0099cc; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                  View My Account
                </a>
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              <p>This is an automated message from Shazam Parking Administration.</p>
              <p>For support, contact us at <a href="mailto:support@shazam.ae">support@shazam.ae</a></p>
            </div>
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
    console.error("Error in send-message-notification function:", error);
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