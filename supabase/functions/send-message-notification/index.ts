import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: ["support@shazam.ae"],
      subject: "New Contact Message from User",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #dc2626, #991b1b); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">🚨 New Contact Message</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">Admin Notification</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #dc2626;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              New contact form submission
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              A user has submitted a message through the contact form on ShazamParking.
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 16px;">📧 Message Details:</h3>
              <p style="color: #7f1d1d; margin: 5px 0;"><strong>From:</strong> ${userEmail}</p>
              <p style="color: #7f1d1d; margin: 5px 0;"><strong>User:</strong> ${userName || userEmail}</p>
              <p style="color: #7f1d1d; margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="color: #374151; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 15px 0; font-size: 16px;">
              Please respond to this message by logging into the admin panel:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://shazamparking.ae/admin" 
                 style="background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Open Admin Panel
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>💡 Note:</strong> You can also reply directly to ${userEmail} if needed.
              </p>
            </div>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              ShazamParking Admin System
            </p>
            <div style="margin-top: 15px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="https://shazamparking.ae" style="color: #dc2626; text-decoration: none;">shazamparking.ae</a>
              </p>
            </div>
          </div>
        </div>
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
