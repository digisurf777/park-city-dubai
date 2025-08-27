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
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "Reset Your ShazamParking Password",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
        <head>
          <meta charset="UTF-8" />
          <title>Reset Password</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>

        <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;margin-top:30px;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding:30px 20px;text-align:center;background:linear-gradient(135deg,#10b981,#059669);">
                      <img src="https://i.ibb.co/rfFDvR2C/logo.png" alt="Shazam Parking Logo" width="120" style="margin-bottom:10px;" />
                      <h1 style="color:#ffffff;font-size:28px;margin:15px 0 0 0;font-weight:bold;">Shazam Parking!</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:40px 40px 30px 40px;text-align:left;">
                      <h2 style="color:#1f2937;font-size:24px;margin:0 0 20px 0;">Password Reset</h2>

                      <p style="font-size:16px;color:#4b5563;line-height:1.6;margin:0 0 15px 0;">
                        Hello,
                      </p>

                      <p style="font-size:16px;color:#4b5563;line-height:1.6;margin:0 0 20px 0;">
                        Dear User<br><br>
                        You have requested to reset your password for your Shazam Parking account.<br><br>
                        To proceed, please click the link below:
                      </p>

                      <!-- Primary action: Reset password URL -->
                      <div style="text-align:center;margin:40px 0;">
                        <a href="${resetUrl}" target="_blank"
                           style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:bold;font-size:16px;display:inline-block;box-shadow:0 4px 12px rgba(16,185,129,0.3);transition:all 0.3s ease;">
                          ✓ Password Reset Link
                        </a>
                      </div>

                      <p style="font-size:12px;color:#9ca3af;line-height:1.5;margin:16px 0 0 0;">
                        If you did not initiate this request, please ignore this email. For your security, the link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:30px 40px;text-align:center;font-size:12px;color:#9ca3af;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                      <p style="margin:0 0 10px 0;">
                        Need help? Contact us at <a href="mailto:support@shazamparking.ae" style="color:#10b981;">support@shazamparking.ae</a>
                      </p>
                      <p style="margin:0;">
                        Should you require any further assistance, feel free to contact us at support@shazamparking.ae.<br><br>
                        <strong>Warm regards,<br>
                        The ShazamParking Team<br>
                        www.shazamparking.ae</strong>
                      </p>
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

    return new Response(JSON.stringify({
      success: true,
      message: "Password reset email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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