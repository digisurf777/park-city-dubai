import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <verify@shazamparking.ae>",
      to: [email],
      subject: "Welcome to ShazamParking - Your Account is Ready!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; font-size: 28px; margin-bottom: 10px;">Welcome to ShazamParking!</h1>
            <p style="color: #666; font-size: 16px;">Your trusted parking platform in Dubai</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">
              ${name ? `Hi ${name}!` : 'Welcome!'} 🎉
            </h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Thank you for joining ShazamParking! Your account has been successfully created and you're now ready to:
            </p>
            
            <ul style="color: #555; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
              <li><strong>Find & Book Parking:</strong> Discover available parking spaces across Dubai's prime locations</li>
              <li><strong>Rent Out Your Space:</strong> Turn your unused parking bay into steady income</li>
              <li><strong>Secure Payments:</strong> Enjoy safe and secure payment processing</li>
              <li><strong>24/7 Support:</strong> Get help whenever you need it</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app-url.com'}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start Using ShazamParking
            </a>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #059669; margin-bottom: 10px; font-size: 16px;">🚗 Popular Locations Available:</h3>
            <p style="color: #065f46; margin: 0; line-height: 1.6;">
              Dubai Marina • Downtown • Business Bay • DIFC • Palm Jumeirah • Deira
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Need help? Contact us at <a href="mailto:support@shazamparking.com" style="color: #10b981;">support@shazamparking.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              ShazamParking - Your Trusted Parking Platform in Dubai
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);