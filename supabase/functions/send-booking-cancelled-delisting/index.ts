import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingCancelledRequest {
  customerEmail: string;
  customerName: string;
  listingTitle: string;
  zone: string;
  startDate: string;
  endDate: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerEmail,
      customerName,
      listingTitle,
      zone,
      startDate,
      endDate,
      bookingId,
    }: BookingCancelledRequest = await req.json();

    console.log(`Sending booking cancellation email to ${customerEmail} for booking ${bookingId}`);

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [customerEmail],
      subject: "Important: Your Parking Booking Has Been Cancelled",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                      <img src="https://eoknluyunximjlsnyceb.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="ShazamParking" style="height: 50px; width: auto;">
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #dc2626; font-size: 24px; margin: 0 0 20px 0;">Booking Cancellation Notice</h1>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear ${customerName || 'Valued Customer'},
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We regret to inform you that your parking booking has been cancelled because the parking space has been removed from the ShazamParking platform.
                      </p>
                      
                      <!-- Booking Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 16px;">Cancelled Booking Details:</h3>
                            <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                <td style="color: #666666; font-size: 14px; width: 120px;">Location:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: bold;">${listingTitle}</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Zone:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: bold;">${zone}</td>
                              </tr>
                              <tr>
                                <td style="color: #666666; font-size: 14px;">Period:</td>
                                <td style="color: #333333; font-size: 14px; font-weight: bold;">${formatDate(startDate)} - ${formatDate(endDate)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>What happens next?</strong>
                      </p>
                      
                      <ul style="color: #333333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                        <li>If you have made any payment for this booking, a full refund will be processed within 5-10 business days.</li>
                        <li>You can browse other available parking spaces on our platform.</li>
                        <li>Our team is here to help you find an alternative parking solution.</li>
                      </ul>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        We sincerely apologize for any inconvenience this may cause. If you have any questions or need assistance finding alternative parking, please don't hesitate to contact us.
                      </p>
                      
                      <!-- Contact Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 20px; text-align: center;">
                            <p style="color: #0369a1; font-size: 14px; margin: 0;">
                              Need help? Contact our support team at<br>
                              <a href="mailto:support@shazamparking.ae" style="color: #0369a1; font-weight: bold;">support@shazamparking.ae</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                        Thank you for your understanding,<br>
                        <strong>The ShazamParking Team</strong>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1a1a2e; padding: 20px; text-align: center;">
                      <p style="color: #ffffff; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} ShazamParking. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`Email sent successfully to ${customerEmail}:`, emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending booking cancellation email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
