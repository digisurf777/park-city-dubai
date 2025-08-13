import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmedRequest {
  userEmail: string;
  userName?: string;
  bookingDetails: {
    location: string;
    startDate: string;
    endDate: string;
    amount: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, bookingDetails }: BookingConfirmedRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [userEmail],
      subject: "Your Booking is Confirmed",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">✅ Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              Dear ${userName || 'Customer'},
            </h2>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="color: #065f46; line-height: 1.6; margin: 0; font-size: 16px;">
                <strong>🎉 Good news! Your parking space booking has been confirmed.</strong>
              </p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px;">📍 Confirmed Booking Details:</h3>
              <div style="color: #0c4a6e; line-height: 1.6;">
                <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.location}</p>
                <p style="margin: 5px 0;"><strong>Start:</strong> ${bookingDetails.startDate}</p>
                <p style="margin: 5px 0;"><strong>End:</strong> ${bookingDetails.endDate}</p>
                <p style="margin: 5px 0;"><strong>Amount Charged:</strong> ${bookingDetails.amount}</p>
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 15px 0; font-size: 16px;">
              Your card will now be charged for the pre-authorized amount and the space is reserved for you.
            </p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>📱 Next Steps:</strong> To contact the space owner or manage your booking, please log in to your account and visit the <strong>Messages section</strong>.
              </p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="https://www.shazamparking.ae/auth" 
                 style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Access My Account
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              If you have any questions, we're here to help — just reply to this email.
            </p>
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

    console.log("Booking confirmed email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Booking confirmed email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmed function:", error);
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