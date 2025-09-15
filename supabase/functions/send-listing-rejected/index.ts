import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ListingRejectedRequest {
  userEmail: string;
  userName?: string;
  listingDetails: {
    title: string;
    address: string;
    zone: string;
    listingId: string;
  };
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, listingDetails, rejectionReason }: ListingRejectedRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [userEmail],
      subject: `Unfortunately, Your Parking Listing Could Not Be Approved - ${listingDetails.title}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">Listing Not Approved</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #ef4444;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              Dear ${userName || 'Property Owner'},
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Unfortunately, we cannot approve your parking listing at this time.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Listing Details:</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Reference ID:</strong> ${listingDetails.listingId}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Property:</strong> ${listingDetails.title}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Address:</strong> ${listingDetails.address}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Zone:</strong> ${listingDetails.zone}</p>
            </div>
            
            ${rejectionReason ? `
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #ef4444;">
              <h4 style="color: #dc2626; margin-top: 0; font-size: 14px;">Reason for Rejection:</h4>
              <p style="color: #7f1d1d; margin: 0; font-size: 14px;">${rejectionReason}</p>
            </div>
            ` : ''}
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              You're welcome to make the necessary adjustments and resubmit your listing. Our team is here to help you get approved.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.shazamparking.ae/rent-out-your-space" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
              Submit New Listing
            </a>
            <a href="mailto:support@shazamparking.ae" 
               style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Contact Support
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

    console.log("Listing rejected email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Listing rejected email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-listing-rejected function:", error);
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