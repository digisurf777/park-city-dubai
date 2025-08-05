import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  email: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, bookingId }: BookingConfirmationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "Your Booking is Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745; text-align: center;">✅ Your Booking is Confirmed</h1>
          
          <p>Dear Customer,</p>
          
          <p><strong>Good news! Your parking space booking has been confirmed.</strong></p>
          
          <p>Your card will now be charged for the pre-authorized amount and the space is reserved for you.</p>
          
          <p>To contact the space owner or manage your booking, please log in to your account and visit the Messages section.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://shazamparking.ae/login" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Booking
            </a>
          </div>
          
          <p>If you have any questions, we're here to help — just reply to this email.</p>
          
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
      subject: `Booking Confirmed: ${bookingId}`,
      html: `
        <h2>Booking Confirmed</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Status:</strong> Confirmed and charged</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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