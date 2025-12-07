import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonthlyFollowupRequest {
  userEmail: string;
  userName: string;
  ownerEmail?: string;
  ownerName?: string;
  bookingDetails: {
    location: string;
    startDate: string;
    endDate: string;
    amount: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, ownerEmail, ownerName, bookingDetails }: MonthlyFollowupRequest = await req.json();

    console.log("Sending monthly follow-up email to driver:", userEmail);

    // Send email to driver
    const driverEmailResponse = await resend.emails.send({
      from: "ShazamParking <notifications@shazamparking.ae>",
      to: [userEmail],
      bcc: ["support@shazamparking.ae"],
      subject: "Monthly Check-In - ShazamParking Booking",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Monthly Check-In</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We hope everything is going smoothly with your parking at <strong>${bookingDetails.location}</strong>!
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #059669; font-size: 18px;">Booking Details</h3>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.location}</p>
              <p style="margin: 5px 0;"><strong>Period:</strong> ${bookingDetails.startDate} - ${bookingDetails.endDate}</p>
              <p style="margin: 5px 0;"><strong>Monthly Amount:</strong> ${bookingDetails.amount}</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              As we approach the end of your booking month, please confirm:
            </p>

            <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
              <li style="margin-bottom: 10px;">✓ There were no issues during the month</li>
              <li style="margin-bottom: 10px;">✓ Payment will be processed as scheduled</li>
            </ul>

            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any concerns or questions, please reach out to us at 
              <a href="mailto:support@shazamparking.ae" style="color: #10B981;">support@shazamparking.ae</a>.
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for choosing ShazamParking!
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Best regards,<br>
              <strong>The ShazamParking Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} ShazamParking. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Driver monthly follow-up email sent successfully:", driverEmailResponse);

    // Send email to owner if provided
    let ownerEmailResponse = null;
    if (ownerEmail) {
      console.log("Sending monthly follow-up email to owner:", ownerEmail);
      ownerEmailResponse = await resend.emails.send({
        from: "ShazamParking <notifications@shazamparking.ae>",
        to: [ownerEmail],
        bcc: ["support@shazamparking.ae"],
        subject: "Monthly Booking Update - ShazamParking",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Monthly Booking Update</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear ${ownerName || 'Property Owner'},</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                This is a monthly update regarding your parking space at <strong>${bookingDetails.location}</strong>.
              </p>

              <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669; font-size: 18px;">Booking Details</h3>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.location}</p>
                <p style="margin: 5px 0;"><strong>Period:</strong> ${bookingDetails.startDate} - ${bookingDetails.endDate}</p>
              </div>

              <p style="font-size: 16px; margin-bottom: 20px;">
                As we approach the end of the booking month, we wanted to confirm that everything is on track. 
                Payment processing will proceed as scheduled.
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                If you have any concerns or issues to report, please contact us at 
                <a href="mailto:support@shazamparking.ae" style="color: #10B981;">support@shazamparking.ae</a>.
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for being part of ShazamParking!
              </p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                Best regards,<br>
                <strong>The ShazamParking Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ShazamParking. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      });
      console.log("Owner monthly follow-up email sent successfully:", ownerEmailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      driverEmail: driverEmailResponse,
      ownerEmail: ownerEmailResponse 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-monthly-followup function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
