import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingPendingRequest {
  userEmail: string;
  userName: string;
  bookingDetails: {
    location: string;
    startDate: string;
    endDate: string;
    amount: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, bookingDetails }: BookingPendingRequest = await req.json();

    // Validate email
    if (!userEmail || !userEmail.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <booking@shazamparking.ae>",
      to: [userEmail],
      subject: "Booking Pending Payment - ShazamParking",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Pending Payment</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⏳ Payment Required</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userName},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your parking booking has been reverted to <strong>pending status</strong> and requires payment to be approved.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">📍 Booking Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${bookingDetails.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Start Date:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${bookingDetails.startDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>End Date:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${bookingDetails.endDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Total Amount:</strong></td>
                    <td style="padding: 10px 0; text-align: right; color: #667eea; font-size: 18px; font-weight: bold;">${bookingDetails.amount}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Action Required:</strong> Your booking will be approved once payment is issued. Please check your account dashboard or contact our support team for payment instructions.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://shazamparking.ae/my-account" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  View My Bookings
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you have any questions, please contact us at 
                <a href="mailto:support@shazamparking.ae" style="color: #667eea; text-decoration: none;">support@shazamparking.ae</a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} ShazamParking. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResponse.error }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Booking pending payment email sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking pending payment email sent successfully',
        emailId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-booking-pending-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
