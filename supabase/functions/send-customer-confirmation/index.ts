import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CustomerConfirmationRequest {
  userEmail: string;
  userName: string;
  listingDetails: {
    buildingName: string;
    district: string;
    bayType: string;
    monthlyPrice: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, listingDetails }: CustomerConfirmationRequest = await req.json();
    
    console.log(`Sending customer confirmation email to ${userName} (${userEmail})`);

    const subject = `✅ Your Parking Listing Submitted Successfully - ${listingDetails.buildingName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚗 ShazamParking</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your listing has been submitted!</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for submitting your parking space listing. We're excited to help you earn passive income from your parking bay!
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Your Listing Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li><strong>Building:</strong> ${listingDetails.buildingName}</li>
              <li><strong>Location:</strong> ${listingDetails.district}</li>
              <li><strong>Type:</strong> ${listingDetails.bayType} parking</li>
              <li><strong>Monthly Rate:</strong> ${listingDetails.monthlyPrice} AED</li>
            </ul>
          </div>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
              <li>Our team will review your listing within <strong>24-48 hours</strong></li>
              <li>We'll verify the details and images you provided</li>
              <li>Once approved, your listing will go live on our platform</li>
              <li>You'll start receiving booking requests from potential renters</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shazamparking.ae/my-account" 
               style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Your Listing Status
            </a>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Complete your ID verification to speed up the approval process! 
              You can do this in your account dashboard.
            </p>
          </div>

          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />

          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Have questions? Reply to this email or contact us at 
            <a href="mailto:support@shazamparking.ae" style="color: #007bff;">support@shazamparking.ae</a>
          </p>

          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>The ShazamParking Team</strong>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated email from ShazamParking. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Customer confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-customer-confirmation function:", error);
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