import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ListingDelistedRequest {
  userEmail: string;
  userName: string;
  listingDetails: {
    title: string;
    address: string;
    zone: string;
    listingId: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, listingDetails }: ListingDelistedRequest = await req.json();

    console.log("Sending listing delisted notification to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <notifications@shazamparking.ae>",
      to: [userEmail],
      bcc: ["support@shazamparking.ae"],
      subject: "Important: Your Parking Listing Has Been Removed",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Listing Removed</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We are writing to inform you that your parking listing has been removed from the ShazamParking platform.
            </p>

            <div style="background: #fff5f5; border-left: 4px solid #FF6B6B; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #FF6B6B; font-size: 18px;">Listing Details</h3>
              <p style="margin: 5px 0;"><strong>Listing ID:</strong> ${listingDetails.listingId}</p>
              <p style="margin: 5px 0;"><strong>Title:</strong> ${listingDetails.title}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${listingDetails.address}</p>
              <p style="margin: 5px 0;"><strong>Zone:</strong> ${listingDetails.zone}</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions about this action or would like to discuss resubmitting your listing, please contact our support team.
            </p>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0; font-size: 14px;"><strong>Support Email:</strong> support@shazamparking.ae</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your understanding.
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Best regards,<br>
              <strong>The ShazamParking Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ShazamParking. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Listing delisted email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-listing-delisted function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
