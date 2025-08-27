import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminBookingNotificationRequest {
  userName: string;
  userEmail: string;
  userPhone?: string;
  bookingId: string;
  parkingSpotName: string;
  zone: string;
  location: string;
  startDate: string;
  duration: number;
  totalCost: number;
  paymentType: string;
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
      bookingId,
      parkingSpotName,
      zone,
      location,
      startDate,
      duration,
      totalCost,
      paymentType,
      notes,
    }: AdminBookingNotificationRequest = await req.json();
    
    console.log(`Sending admin booking notification for booking ${bookingId} from ${userName}`);

    const subject = `🚗 New Parking Booking Request - ${parkingSpotName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Parking Booking Request
        </h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #007bff; margin-top: 0;">Booking Details:</h2>
          <p><strong>Reference:</strong> ${bookingId}</p>
          <p><strong>Parking Spot:</strong> ${parkingSpotName}</p>
          <p><strong>Zone:</strong> ${zone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${duration} month(s)</p>
          <p><strong>Total Cost:</strong> ${totalCost} AED</p>
          <p><strong>Payment Type:</strong> ${paymentType === 'one_time' ? 'One-time Payment' : 'Monthly Recurring'}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>

        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Customer Information:</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone || 'Not provided'}</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #856404; margin-top: 0;">Next Steps:</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Customer has been sent a payment link</li>
            <li>Payment will be pre-authorized (not charged immediately)</li>
            <li>Review and confirm booking within 48 hours</li>
            <li>Payment will be processed upon confirmation</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 20px;">Please review and approve this booking in the admin panel.</p>
          <a href="https://preview--park-city-dubai.lovable.app/admin-panel" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Booking in Admin Panel
          </a>
        </div>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email from the ShazamParking booking notification system.<br>
          <strong>ShazamParking Team</strong><br>
          support@shazamparking.ae<br>
          www.shazamparking.ae
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking Bookings <onboarding@resend.dev>",
      to: ["support@shazamparking.ae"],
      subject: subject,
      html: htmlContent,
    });

    console.log("Admin booking notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-booking-notification function:", error);
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