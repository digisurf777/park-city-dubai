import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRejectionRequest {
  email: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, bookingId }: BookingRejectionRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "Unfortunately, Your Booking Could Not Be Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc3545; text-align: center;">❌ Booking Could Not Be Confirmed</h1>
          
          <p>Dear Customer,</p>
          
          <p><strong>Unfortunately, the space you selected is no longer available.</strong></p>
          
          <p>Your booking request has been cancelled and no charges have been made. The card pre-authorization has now been released.</p>
          
          <p>We're sorry for the inconvenience and appreciate your understanding.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shazamparking.ae" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Find Another Space
            </a>
          </div>
          
          <p>If you need help finding a suitable alternative, feel free to contact us anytime.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Best regards,<br>
            The ShazamParking Team<br>
            <a href="mailto:support@shazamparking.ae">support@shazamparking.ae</a><br>
            <a href="https://shazamparking.ae">www.shazamparking.ae</a>
          </p>
        </div>
      `,
    });

    // Also send admin notification
    await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: ["support@shazamparking.ae"],
      subject: `Booking Rejected: ${bookingId}`,
      html: `
        <h2>Booking Rejected</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Status:</strong> Rejected - Authorization released</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Booking rejection email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-rejection function:", error);
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