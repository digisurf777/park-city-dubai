import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminListingNotificationRequest {
  userName: string;
  userEmail: string;
  userPhone?: string;
  listingId: string;
  buildingName: string;
  district: string;
  bayType: string;
  monthlyPrice: number;
  accessDeviceDeposit?: number;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userName,
      userEmail,
      userPhone,
      listingId,
      buildingName,
      district,
      bayType,
      monthlyPrice,
      accessDeviceDeposit,
      notes,
    }: AdminListingNotificationRequest = await req.json();
    
    console.log(`Sending admin listing notification for listing ${listingId} from ${userName}`);

    const subject = `🏢 New Parking Listing Submitted - ${buildingName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          New Parking Listing Submitted
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #28a745; margin-top: 0;">Listing Details:</h2>
          <p><strong>Reference:</strong> ${listingId}</p>
          <p><strong>Building/Tower:</strong> ${buildingName}</p>
          <p><strong>District:</strong> ${district}</p>
          <p><strong>Bay Type:</strong> ${bayType}</p>
          <p><strong>Monthly Price:</strong> ${monthlyPrice} AED</p>
          ${accessDeviceDeposit ? `<p><strong>Access Device Deposit:</strong> ${accessDeviceDeposit} AED</p>` : ''}
          ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
        </div>

        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Owner Information:</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone || 'Not provided'}</p>
        </div>

        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #155724; margin-top: 0;">Next Steps:</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Review the listing details and uploaded images</li>
            <li>Verify owner information and contact details</li>
            <li>Approve or request modifications to the listing</li>
            <li>Notify owner of approval status via email</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 20px;">Please review and approve this listing in the admin panel.</p>
          <a href="https://preview--park-city-dubai.lovable.app/admin-panel" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Listing in Admin Panel
          </a>
        </div>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email from the ShazamParking listing notification system.<br>
          <strong>ShazamParking Team</strong><br>
          support@shazamparking.ae<br>
          www.shazamparking.ae
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking Listings <onboarding@resend.dev>",
      to: ["support@shazamparking.ae"],
      subject: subject,
      html: htmlContent,
    });

    console.log("Admin listing notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-listing-notification function:", error);
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