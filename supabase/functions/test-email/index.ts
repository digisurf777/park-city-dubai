import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    console.log(`Testing email send to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <onboarding@resend.dev>",
      to: [email],
      subject: "Test Email - ShazamParking Email System",
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email from ShazamParking to verify that our email system is working correctly.</p>
        <p>If you're receiving this, it means the email configuration is working properly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `,
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      message: "Test email sent successfully!"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in test-email function:", error);
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