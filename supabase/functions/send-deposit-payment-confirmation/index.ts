import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepositConfirmationEmail {
  ownerName: string;
  ownerEmail: string;
  listingTitle: string;
  depositAmount: number;
  transactionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerName, ownerEmail, listingTitle, depositAmount, transactionId }: DepositConfirmationEmail = await req.json();

    console.log("Sending deposit payment confirmation email to:", ownerEmail);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [ownerEmail],
      subject: "✅ Deposit Payment Confirmed - ShazamParking",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your deposit payment has been successfully received and confirmed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">Payment Details</h3>
              <p style="margin: 10px 0;"><strong>Listing:</strong> ${listingTitle}</p>
              <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ${depositAmount} AED</p>
              <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">CONFIRMED ✓</span></p>
            </div>
            
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">
                <strong>✨ What's Next?</strong><br>
                Our team will now coordinate the delivery of your parking access device. You'll receive a separate email with delivery details within 1-2 business days.
              </p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">🔑 About Your Access Device</h3>
            <ul style="font-size: 15px; line-height: 1.8; color: #555;">
              <li>Allows drivers to access your parking space</li>
              <li>May be a key card, remote control, or gate access code</li>
              <li>Must be returned in good condition for full refund</li>
              <li>Keep it secure and do not duplicate</li>
            </ul>
            
            <h3 style="color: #333; margin-top: 30px;">💰 Deposit Refund Terms</h3>
            <p style="font-size: 15px; color: #555;">
              Your ${depositAmount} AED deposit will be fully refunded when:
            </p>
            <ul style="font-size: 15px; line-height: 1.8; color: #555;">
              <li>You return the access device</li>
              <li>The device is in working condition</li>
              <li>You decide to end your listing with ShazamParking</li>
            </ul>
            
            <p style="font-size: 15px; color: #555; margin-top: 20px;">
              Refunds are processed within 5-7 business days after device return.
            </p>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>📝 Keep This Email:</strong> Save this confirmation for your records. Your transaction ID may be needed for future reference.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://shazamparking.ae/my-account" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                View My Listings
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Thank you for choosing ShazamParking!</p>
            <p style="font-size: 14px; color: #666; margin-top: 0;"><strong>The ShazamParking Team</strong></p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">
                Need help? Contact us at support@shazamparking.ae<br>
                <a href="https://shazamparking.ae" style="color: #667eea;">shazamparking.ae</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Deposit payment confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending deposit payment confirmation email:", error);
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
