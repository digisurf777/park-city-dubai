import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignupNotificationRequest {
  fullName: string;
  email: string;
  userType: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, userType }: SignupNotificationRequest = await req.json();

    console.log("Sending admin notification for new signup:", { fullName, email, userType });

    const currentDate = new Date().toLocaleString();

    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <onboarding@resend.dev>",
      to: ["digisurf777@gmail.com"],
      subject: "New User Sign-Up Notification",
      html: `
        <h2>New User Sign-Up Notification</h2>
        <p>A new user has signed up for Shazam Parking:</p>
        <br>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User Type:</strong> ${userType}</p>
        <p><strong>Date:</strong> ${currentDate}</p>
        <br>
        <p>This is an automated notification from the Shazam Parking system.</p>
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
    console.error("Error sending admin notification:", error);
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