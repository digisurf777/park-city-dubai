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

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Message from ShazamParking Admin: ${subject}`,
      html: `
        <h1>You have a new message from ShazamParking Admin!</h1>
        <p>Hello ${userName},</p>
        <p>You have received a message from the ShazamParking administration team.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Subject: ${subject}</h3>
          <div style="color: #555; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p>Please log in to your ShazamParking account to view your messages and respond if needed.</p>
        
        <div style="margin: 30px 0;">
          <a href="https://1f056007-f350-4973-ab3d-3d7b5c7cd1db.lovableproject.com/my-account" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Account
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated email from ShazamParking. Please do not reply to this email.
          <br>For support, please contact us through the app or website.
        </p>
      `,
    });

    console.log("Message notification email sent successfully:", emailResponse);

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