
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();
    
    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your ShazamParking password",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Reset your password</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: #0099cc;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="Shazam Parking Logo" width="140" style="margin-bottom: 10px;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333;">Reset your password</h2>
                        <p style="font-size: 16px; color: #555555;">
                          Hello,
                        </p>
                        <p style="font-size: 16px; color: #555555;">
                          We received a request to reset your password for your ShazamParking account. Click the link below to set a new password:
                        </p>
                        <p style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}" target="_blank" style="background-color: #0099cc; color: #ffffff; text-decoration: none; padding: 14px 26px; border-radius: 6px; font-weight: bold;">
                            Reset my password
                          </a>
                        </p>
                        <p style="font-size: 14px; color: #999999;">
                          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                        <p style="font-size: 14px; color: #999999;">
                          This link will expire in 1 hour for security reasons.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; text-align: center; font-size: 12px; color: #999999;">
                        For help, please contact <a href="mailto:support@shazam.ae">support@shazam.ae</a><br />
                        <br />
                        Kind regards,<br />
                        The ShazamParking Team
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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
