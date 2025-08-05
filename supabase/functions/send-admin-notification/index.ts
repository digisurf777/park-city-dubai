import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: 'parking_listing' | 'id_verification';
  userEmail: string;
  userName: string;
  details: {
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userEmail, userName, details }: AdminNotificationRequest = await req.json();
    
    console.log(`Sending admin notification for ${type} from ${userName} (${userEmail})`);

    let subject = "";
    let htmlContent = "";

    if (type === 'parking_listing') {
      subject = `🚗 New Parking Listing Submitted - ${details.buildingName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Parking Listing Submitted
          </h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #007bff; margin-top: 0;">Listing Details:</h2>
            <p><strong>Building/Tower:</strong> ${details.buildingName}</p>
            <p><strong>District:</strong> ${details.district}</p>
            <p><strong>Bay Type:</strong> ${details.bayType}</p>
            <p><strong>Monthly Price:</strong> ${details.monthlyPrice} AED</p>
            ${details.accessDeviceDeposit ? `<p><strong>Access Device Deposit:</strong> ${details.accessDeviceDeposit} AED</p>` : ''}
          </div>

          <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Owner Information:</h2>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Phone:</strong> ${details.phone}</p>
          </div>

          ${details.notes ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #856404; margin-top: 0;">Additional Notes:</h2>
            <p style="margin: 0;">${details.notes}</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 20px;">Please review and approve this listing in the admin panel.</p>
            <a href="https://preview--park-city-dubai.lovable.app/admin-panel" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Admin Panel
            </a>
          </div>
          
          <hr style="margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email from the ShazamParking admin notification system.
          </p>
        </div>
      `;
    } else if (type === 'id_verification') {
      subject = `🆔 New ID Verification Submitted - ${userName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            New ID Verification Submitted
          </h1>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #28a745; margin-top: 0;">Verification Details:</h2>
            <p><strong>User Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Document Type:</strong> ${details.documentType}</p>
            ${details.nationality ? `<p><strong>Nationality:</strong> ${details.nationality}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 20px;">Please review the submitted ID document and approve or reject the verification.</p>
            <a href="https://preview--park-city-dubai.lovable.app/admin-panel" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Admin Panel
            </a>
          </div>
          
          <hr style="margin: 30px 0;" />
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated email from the ShazamParking admin notification system.
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "ShazamParking Admin <onboarding@resend.dev>",
      to: ["support@shazam.ae"], // Changed to support@shazam.ae
      subject: subject,
      html: htmlContent,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
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