import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingRequestRequest {
  email: string;
  bookingId: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, bookingId, amount }: BookingRequestRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [email],
      subject: "Your Booking Request Has Been Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #007bff; text-align: center;">✅ Booking Request Received</h1>
          
          <p>Dear Customer,</p>
          
          <p><strong>Thank you for booking with ShazamParking.</strong></p>
          
          <p>We've received your request and your payment card has been securely pre-authorized for the rental amount.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Please note that this is not yet a confirmation of your booking.</strong></p>
          </div>
          
          <p>We are now contacting the space owner to verify availability. You will receive an update within 48 hours.</p>
          
          <ul style="line-height: 1.6;">
            <li>If the space is confirmed, your card will be charged and your booking finalized.</li>
            <li>If it's no longer available, the pre-authorization will be released and no payment will be taken.</li>
          </ul>
          
          <p>Thank you for choosing ShazamParking.</p>
          
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
      subject: `New Booking Request: ${bookingId}`,
      html: `
        <h2>New Booking Request Received</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Amount:</strong> AED ${amount}</p>
        <p><strong>Status:</strong> Pre-authorized (pending owner confirmation)</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        
        <p><strong>Action Required:</strong> Contact space owner to verify availability.</p>
      `,
    });

    console.log("Booking request email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-request function:", error);
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