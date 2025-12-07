import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepositPaymentRequestEmail {
  ownerName: string;
  ownerEmail: string;
  listingTitle: string;
  paymentUrl: string;
  depositAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerName, ownerEmail, listingTitle, paymentUrl, depositAmount }: DepositPaymentRequestEmail = await req.json();

    console.log("Sending deposit payment request email to:", ownerEmail);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [ownerEmail],
      bcc: ["support@shazamparking.ae"],
      subject: "🔑 Access Device Deposit Payment Required - ShazamParking",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Access Device Deposit</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Congratulations! Your parking listing "<strong>${listingTitle}</strong>" has been approved and requires an access device.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Deposit Details</h3>
              <p style="margin: 10px 0;"><strong>Amount:</strong> ${depositAmount} AED</p>
              <p style="margin: 10px 0;"><strong>Purpose:</strong> Refundable access device deposit</p>
              <p style="margin: 10px 0; font-size: 14px; color: #666;">
                This deposit secures your parking access device (key card, remote, or gate opener). 
                It will be fully refunded when you return the device in good condition.
              </p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">What happens next?</h3>
            <ol style="font-size: 15px; line-height: 1.8;">
              <li><strong>Complete the payment</strong> using the secure link below</li>
              <li><strong>Receive your access device</strong> - We'll coordinate delivery after payment</li>
              <li><strong>Start earning</strong> - Your listing will go live once setup is complete</li>
              <li><strong>Get refunded</strong> - Full deposit returned when you return the device</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                💳 Pay ${depositAmount} AED Deposit
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Important:</strong> This is a one-time refundable deposit. You'll receive the full amount back when you return the access device in working condition.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions about the deposit or access device, please contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Best regards,</p>
            <p style="font-size: 14px; color: #666; margin-top: 0;"><strong>The ShazamParking Team</strong></p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">
                ShazamParking - Smart Parking Solutions for Dubai<br>
                <a href="https://shazamparking.ae" style="color: #667eea;">shazamparking.ae</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Deposit payment request email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending deposit payment request email:", error);
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
