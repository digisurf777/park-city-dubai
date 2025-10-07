import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingApprovedRequest {
  userEmail: string;
  userName?: string;
  bookingDetails: {
    location: string;
    startDate: string;
    endDate: string;
    amount: string;
  };
  paymentLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, bookingDetails, paymentLink }: BookingApprovedRequest = await req.json();

    // Basic recipient validation to avoid silent failures
    const isValidEmail = (email: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    if (!userEmail || !isValidEmail(userEmail)) {
      console.warn('Invalid or missing userEmail:', userEmail);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or missing recipient email' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [userEmail],
      subject: "🎉 Great News! Your Parking Booking Has Been Approved",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: bold;">🎉 Booking Approved!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">
              Dear ${userName || 'Customer'},
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Excellent news! Your parking booking request has been <strong>approved</strong>! 🎯
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">📍 Booking Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Location:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${bookingDetails.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Start Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${bookingDetails.startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">End Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${bookingDetails.endDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                  <td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">${bookingDetails.amount}</td>
                </tr>
              </table>
            </div>
            
            ${paymentLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                💳 View Booking Details
              </a>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                Click the button above to view your booking
              </p>
            </div>
            ` : ''}
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
              Your parking space is confirmed! If you have any questions, feel free to contact us anytime. We're excited to serve you!
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

    if (emailResponse?.error) {
      console.error('Resend send error:', emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error }),
        { status: 422, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log("Booking approved email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Booking approved email sent successfully",
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-approved function:", error);
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