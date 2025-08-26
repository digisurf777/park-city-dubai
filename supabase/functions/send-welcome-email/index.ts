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
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [email],
      subject: "Welcome to ShazamParking - Email Confirmation Required",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
            <img src="https://shazamparking.ae/shazam-logo.png" alt="Shazam Parking Logo" width="120" style="margin-bottom: 10px;" />
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">Welcome to ShazamParking!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Your trusted parking platform in Dubai</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">
              ${name ? `Hi ${name}!` : 'Hello!'} 🎉
            </h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Thank you for joining ShazamParking! We've received your signup request, and you should have received an email confirmation link.
            </p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">📧 Next Steps:</h3>
              <ol style="color: #065f46; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Check your email inbox for the confirmation link</li>
                <li>Click the confirmation link to verify your account</li>
                <li>Log in to access your "My Account" section</li>
                <li>Complete the verification process to unlock all features</li>
              </ol>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0; font-style: italic;">
              <strong>Important:</strong> You'll need to complete verification before you can book spaces or list your parking.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shazamparking.ae/auth" 
               style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Go to Login Page
            </a>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">🚗 What You Can Do After Verification:</h3>
            <div style="display: grid; gap: 10px;">
              <p style="color: #075985; margin: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🔍</span> Find & Book Parking in Dubai's prime locations
              </p>
              <p style="color: #075985; margin: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">💰</span> Rent Out Your Space for steady income
              </p>
              <p style="color: #075985; margin: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🔒</span> Secure Payments with full protection
              </p>
              <p style="color: #075985; margin: 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📞</span> 24/7 Support whenever you need it
              </p>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📍 Popular Areas Available:</h3>
            <p style="color: #b45309; margin: 0; line-height: 1.6; font-weight: 500;">
              Dubai Marina • Downtown • Business Bay • DIFC • Palm Jumeirah • Deira
            </p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Need help? Contact us at <a href="mailto:support@shazamparking.ae" style="color: #10b981; text-decoration: none; font-weight: 600;">support@shazamparking.ae</a>
            </p>
            <div style="margin-top: 15px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">ShazamParking - Your Trusted Parking Platform in Dubai</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">www.shazamparking.ae</p>
            </div>
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