import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  fullName: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, token }: VerificationEmailRequest = await req.json();
    
    console.log(`Sending custom verification email to: ${email}`);

    const verificationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent('https://shazamparking.ae/email-confirmed')}`;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <verify@shazamparking.ae>",
      to: [email],
      subject: "Confirm Your Email - ShazamParking",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Email - ShazamParking</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4ECDC4 0%, #3BB8B1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ShazamParking!</h1>
            <p style="color: #e8f8f7; margin: 10px 0 0 0; font-size: 16px;">Please confirm your email address</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4ECDC4; margin-top: 0;">Hi ${fullName}!</h2>
            
            <p>Thank you for signing up for ShazamParking. To complete your registration and activate your account, please confirm your email address by clicking the button below.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #4ECDC4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Confirm Email Address
              </a>
            </div>
            
            <div style="background: #f0fffe; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4ECDC4;">
              <h3 style="color: #4ECDC4; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Click the confirmation link above</li>
                <li>Your account will be activated automatically</li>
                <li>Start finding and booking parking spaces in Dubai</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This verification link will expire in 24 hours for security reasons. If you didn't create an account with ShazamParking, you can safely ignore this email.
            </p>
            
            <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 ShazamParking. All rights reserved.<br>
              This is an automated email, please do not reply.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Custom verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email-custom function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send verification email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);