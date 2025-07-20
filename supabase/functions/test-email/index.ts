
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing email configuration...');

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY is not configured",
          status: "failed"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('RESEND_API_KEY is configured, testing email send...');

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "Shazam Parking Test <bookings@shazam.ae>",
      to: ["support@shazam.ae"],
      subject: "🧪 Email Configuration Test",
      html: `
        <h1>Email Configuration Test</h1>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Function:</strong> test-email</p>
        <p>If you receive this email, the configuration is working properly.</p>
      `,
    });

    console.log('Test email response:', emailResponse);

    if (emailResponse.error) {
      console.error('Error sending test email:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: emailResponse.error.message,
          status: "failed",
          details: emailResponse.error
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        status: "sent",
        message: "Test email sent successfully to support@shazam.ae",
        emailId: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in test-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
