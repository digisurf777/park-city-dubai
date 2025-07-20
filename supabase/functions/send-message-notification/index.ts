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
      from: "Shazam Parking <onboarding@resend.dev>",
      to: ["digisurf777@gmail.com"],
      subject: `New Support Message: ${subject}`,
      html: `
        <h1>New support message from ${userEmail}</h1>
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p><strong>Please forward this to support@shazam.ae or respond directly to the customer.</strong></p>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the Shazam Parking support system.
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