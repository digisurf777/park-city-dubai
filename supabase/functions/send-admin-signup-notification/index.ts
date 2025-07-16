import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  email: string;
  fullName: string;
  userType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, userType }: AdminNotificationRequest = await req.json();

    const userTypeLabel = userType === 'owner' ? 'Parking Owner' : 'Parking Seeker';
    
    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <onboarding@resend.dev>",
      to: ["digisurf777@gmail.com"],
      subject: `New User Sign-Up: ${userTypeLabel}`,
      html: `
        <h1>New User Sign-Up Notification</h1>
        <p>A new user has signed up:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>User Details:</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${userTypeLabel}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>This user will need to confirm their email before they can log in.</p>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the Shazam Parking signup system.
        </p>
      `,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-signup-notification function:", error);
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