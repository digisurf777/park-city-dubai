import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ListingApprovedRequest {
  listingId: string;
  userName: string;
  userEmail: string;
  buildingName: string;
  district: string;
  bayType: string;
  monthlyPrice: number;
  accessDeviceDeposit?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      listingId,
      userName,
      userEmail,
      buildingName,
      district,
      bayType,
      monthlyPrice,
      accessDeviceDeposit,
    }: ListingApprovedRequest = await req.json();

    const listingTitle = `${buildingName} - ${bayType} in ${district}`;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [userEmail],
      subject: "🎉 Your Parking Listing Has Been Approved!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">🎉 Listing Approved!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              Congratulations ${userName}!
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Great news! Your parking listing has been approved and is now live on ShazamParking. Customers can now find and book your parking space.
            </p>
            
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #10b981; margin-top: 0; font-size: 16px;">Your Approved Listing:</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Reference ID:</strong> ${listingId}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Property:</strong> ${listingTitle}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Monthly Price:</strong> ${monthlyPrice} AED</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Access Device Deposit:</strong> ${accessDeviceDeposit && accessDeviceDeposit > 0 ? 'Yes' : 'No'}</p>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0; font-size: 16px;">What happens next?</h3>
              <ul style="color: #155724; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                <li>Your parking space is now visible to customers on our platform</li>
                <li>You'll receive booking notifications when customers request your space</li>
                <li>You can manage your listing and bookings through your account</li>
                <li>Our team will coordinate payment and access arrangements</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              Thank you for choosing ShazamParking to list your parking space!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.shazamparking.ae/my-account" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
              Manage My Listing
            </a>
            <a href="https://www.shazamparking.ae"
               style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Visit ShazamParking
            </a>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              Best regards,<br>
              The ShazamParking Team
            </p>
            <div style="margin-top: 15px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                <a href="mailto:support@shazamparking.ae" style="color: #10b981; text-decoration: none;">support@shazamparking.ae</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                <a href="https://www.shazamparking.ae" style="color: #10b981; text-decoration: none;">www.shazamparking.ae</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Listing approved email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Listing approved email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-listing-approved function:", error);
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