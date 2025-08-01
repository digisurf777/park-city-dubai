import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupConfirmationRequest {
  email: string;
  fullName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, confirmationUrl }: SignupConfirmationRequest = await req.json();

    console.log(`Sending signup confirmation email to ${fullName} (${email})`);
    console.log(`Confirmation URL: ${confirmationUrl}`);

    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <noreply@shazamparking.ae>",
      to: [email],
      subject: "Welcome to Shazam Parking - Confirm Your Email",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Shazam Parking!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with brand colors -->
            <div style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); padding: 40px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">
                Welcome to Shazam Parking!
              </h1>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 32px;">
              <h2 style="color: #202020; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                Hello ${fullName}!
              </h2>
              
              <p style="color: #555555; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                Thank you for registering with Shazam Parking. To complete your registration and activate your account, please confirm your email address by clicking the button below.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${confirmationUrl}" 
                   style="display: inline-block; background-color: #4ECDC4; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease;">
                  Confirm Your Account
                </a>
              </div>
              
              <p style="color: #777777; margin: 24px 0 0 0; font-size: 14px; line-height: 1.5;">
                If you didn't register for Shazam Parking, please ignore this message.
              </p>
              
              <p style="color: #777777; margin: 12px 0 0 0; font-size: 14px; line-height: 1.5;">
                This link is valid for 24 hours. If you can't click the button, copy and paste the following link into your browser:
              </p>
              
              <div style="background-color: #f8f9fa; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #4ECDC4;">
                <p style="margin: 0; font-size: 14px; color: #555555; word-break: break-all;">
                  <a href="${confirmationUrl}" style="color: #4ECDC4; text-decoration: none;">
                    ${confirmationUrl}
                  </a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 32px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #202020;">
                Shazam Parking
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #777777;">
                The easiest way to find parking in Dubai
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    console.log("Signup confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending signup confirmation email:", error);
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