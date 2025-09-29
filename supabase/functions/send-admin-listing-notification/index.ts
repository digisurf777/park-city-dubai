import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminListingNotificationRequest {
  listingId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  buildingName: string;
  district: string;
  bayType: string;
  monthlyPrice: number;
  accessDeviceDeposit?: number;
  notes?: string;
  isApproved?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("DEBUG: Received request body:", JSON.stringify(requestBody, null, 2));
    
    const {
      listingId,
      userName,
      userEmail,
      userPhone,
      buildingName,
      district,
      bayType,
      monthlyPrice,
      accessDeviceDeposit,
      notes,
      isApproved = false,
    }: AdminListingNotificationRequest = requestBody;
    
    console.log(`DEBUG: Extracted values - listingId: ${listingId}, userName: ${userName}, buildingName: ${buildingName}, district: ${district}, bayType: ${bayType}`);

    const listingTitle = `${buildingName} - ${bayType} in ${district}`;
    const subject = isApproved 
      ? `✅ Your Parking Listing "${listingTitle}" has been Approved!`
      : `📋 New Parking Listing Submitted - ${listingTitle}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid ${isApproved ? '#28a745' : '#007bff'}; padding-bottom: 10px;">
          ${isApproved ? 'Listing Approved!' : 'New Parking Listing Submitted'}
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: ${isApproved ? '#28a745' : '#007bff'}; margin-top: 0;">Listing Details:</h2>
          <p><strong>Reference:</strong> ${listingId}</p>
          <p><strong>Title:</strong> ${listingTitle}</p>
          <p><strong>Zone:</strong> ${district}</p>
          <p><strong>Owner:</strong> ${userName}</p>
          <p><strong>Building:</strong> ${buildingName}</p>
          <p><strong>Bay Type:</strong> ${bayType}</p>
          <p><strong>Monthly Price:</strong> ${monthlyPrice} AED</p>
          <p><strong>Access Device Deposit:</strong> ${accessDeviceDeposit && accessDeviceDeposit > 0 ? 'Yes' : 'No'}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          ${userPhone ? `<p><strong>Phone:</strong> ${userPhone}</p>` : ''}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>

        ${isApproved ? `
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; color: #155724;">
          <h2 style="color: #155724; margin-top: 0;">🎉 Congratulations!</h2>
          <p>Your parking listing has been approved and is now live on ShazamParking.ae!</p>
          <p>Customers can now find and book your parking space through our platform.</p>
        </div>
        ` : `
        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Next Steps:</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Review the listing details and uploaded images</li>
            <li>Verify owner information and contact details</li>
            <li>Approve or request modifications to the listing</li>
            <li>Notify owner of approval status via email</li>
          </ul>
        </div>
        `}

        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 20px;">${isApproved ? 'Thank you for choosing ShazamParking!' : 'Please review and approve this listing in the admin panel.'}</p>
          <a href="https://shazamparking.ae${isApproved ? '' : '/admin'}" 
             style="background-color: ${isApproved ? '#28a745' : '#007bff'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ${isApproved ? 'Visit ShazamParking.ae' : 'Review Listing in Admin Panel'}
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

    // Send to admin if it's a new submission, send to user if it's approved
    const recipientEmail = isApproved && userEmail ? userEmail : "support@shazamparking.ae";

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [recipientEmail],
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