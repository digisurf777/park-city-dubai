import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OwnerBookingConfirmedRequest {
  ownerEmail: string;
  ownerName?: string;
  bookingDetails: {
    location: string;
    driverName?: string;
    startDate: string;
    endDate: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerEmail, ownerName, bookingDetails }: OwnerBookingConfirmedRequest = await req.json();

    console.log("Sending owner booking confirmation email to:", ownerEmail);

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [ownerEmail],
      bcc: ["support@shazamparking.ae"],
      subject: "Your parking space booking has been confirmed - ShazamParking",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">Booking Confirmed</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              Dear ${ownerName || 'Parking Space Owner'},
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Thank you for confirming availability. The booking for your space has now been successfully confirmed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Booking Details:</h3>
              <p style="color: #4b5563; margin: 8px 0; font-size: 14px;"><strong>Location:</strong> ${bookingDetails.location}</p>
              ${bookingDetails.driverName ? `<p style="color: #4b5563; margin: 8px 0; font-size: 14px;"><strong>Driver:</strong> ${bookingDetails.driverName}</p>` : ''}
              <p style="color: #4b5563; margin: 8px 0; font-size: 14px;"><strong>Start:</strong> ${bookingDetails.startDate}</p>
              <p style="color: #4b5563; margin: 8px 0; font-size: 14px;"><strong>End:</strong> ${bookingDetails.endDate}</p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              You can now communicate directly with the driver via the in-platform chat to arrange access and any practical details related to the parking space.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://www.shazamparking.ae/my-account" 
                 style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Open Dashboard
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              If you have any questions or encounter any issues, we remain available via email at <a href="mailto:support@shazamparking.ae" style="color: #10b981; text-decoration: none;">support@shazamparking.ae</a> or through the internal chat function in your dashboard.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              We hope everything proceeds smoothly and look forward to ensuring a seamless experience for both you and the driver.
            </p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              Kind regards,<br>
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

    console.log("Owner booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Owner booking confirmation email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-owner-booking-confirmed function:", error);
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
