import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OwnerPayoutNotificationRequest {
  ownerEmail: string;
  ownerFirstName: string;
  paymentId?: string;
}

const getEmailTemplate = (ownerFirstName: string) => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monthly ShazamParking Payout Is Being Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #10b981; padding: 30px 40px; text-align: center;">
              <img src="https://shazamparking.ae/lovable-uploads/logo.png" alt="ShazamParking" style="height: 50px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Your Monthly Payout Is Being Processed</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${ownerFirstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We are now processing your monthly payout, which will be transferred to the bank account registered in your ShazamParking profile.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Payouts should reach you within 15 days of this email.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Please ensure your bank account details are accurate and up to date in the portal to avoid delays.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Kind regards,<br>
                <strong>The ShazamParking Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      <a href="https://shazamparking.ae" style="color: #10b981; text-decoration: none;">shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Email: <a href="mailto:support@shazamparking.ae" style="color: #9ca3af; text-decoration: none;">support@shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Location: Dubai, UAE
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px 0;">
                      Registered: Shazam Technology Solutions FZCO
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                      This email and any attachments are confidential and intended solely for the addressee. 
                      If you have received this email in error, please notify the sender immediately and delete this email. 
                      Any unauthorized copying, disclosure, or distribution of this email is strictly prohibited.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                © ${currentYear} ShazamParking. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-owner-payout-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerEmail, ownerFirstName, paymentId }: OwnerPayoutNotificationRequest = await req.json();

    console.log(`Sending payout notification to owner: ${ownerEmail}, name: ${ownerFirstName}, payment: ${paymentId || 'N/A'}`);

    if (!ownerEmail) {
      throw new Error("Owner email is required");
    }

    const firstName = ownerFirstName || "Valued Partner";
    const htmlContent = getEmailTemplate(firstName);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [ownerEmail],
      bcc: ["support@shazamparking.ae"],
      subject: "Your Monthly ShazamParking Payout Is Being Processed",
      html: htmlContent,
    });

    console.log("Payout notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payout notification email sent successfully",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending payout notification email:", error);
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
