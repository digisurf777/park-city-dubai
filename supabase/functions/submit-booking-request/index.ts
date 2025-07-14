import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  parkingSpotId: string;
  parkingSpotName: string;
  startDate: string;
  duration: number;
  totalPrice: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
  notes?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Booking request function started');

    // Initialize Supabase client with service role for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const bookingData: BookingRequest = await req.json();
    console.log('Received booking data:', bookingData);

    // Calculate end date
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + bookingData.duration);

    // Store booking request in database
    const { data: booking, error: bookingError } = await supabaseClient
      .from('parking_bookings')
      .insert({
        user_id: user.id,
        location: bookingData.parkingSpotName,
        zone: "Product Page", // You might want to extract this from the parking spot
        start_time: bookingData.startDate,
        end_time: endDate.toISOString(),
        duration_hours: bookingData.duration * 30 * 24, // Approximate hours for months
        cost_aed: bookingData.totalPrice,
        status: 'pending_review'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    console.log('Booking created successfully:', booking);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Parking App <onboarding@resend.dev>",
      to: ["digisurf777@gmail.com"],
      subject: `New Booking Request - ${bookingData.parkingSpotName}`,
      html: `
        <h1>New Parking Space Booking Request</h1>
        <p><strong>Booking Details:</strong></p>
        <ul>
          <li><strong>Customer:</strong> ${bookingData.userName} (${bookingData.userEmail})</li>
          <li><strong>Phone:</strong> ${bookingData.userPhone || 'Not provided'}</li>
          <li><strong>Parking Space:</strong> ${bookingData.parkingSpotName}</li>
          <li><strong>Start Date:</strong> ${new Date(bookingData.startDate).toLocaleDateString()}</li>
          <li><strong>Duration:</strong> ${bookingData.duration} month(s)</li>
          <li><strong>End Date:</strong> ${endDate.toLocaleDateString()}</li>
          <li><strong>Total Price:</strong> AED ${bookingData.totalPrice}</li>
          <li><strong>Booking ID:</strong> ${booking.id}</li>
        </ul>
        ${bookingData.notes ? `<p><strong>Notes:</strong> ${bookingData.notes}</p>` : ''}
        <p><strong>Action Required:</strong> Contact the customer within 2 working days to confirm availability and provide payment link.</p>
        <hr>
        <p><em>This booking request was submitted through the parking website.</em></p>
      `,
    });

    console.log('Admin notification sent:', adminEmailResponse);

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Parking App <onboarding@resend.dev>",
      to: [bookingData.userEmail],
      subject: `Booking Request Received - ${bookingData.parkingSpotName}`,
      html: `
        <h1>Your Booking Request Has Been Received!</h1>
        <p>Hello ${bookingData.userName},</p>
        <p>Thank you for your parking space booking request. Here are your details:</p>
        <ul>
          <li><strong>Parking Space:</strong> ${bookingData.parkingSpotName}</li>
          <li><strong>Start Date:</strong> ${new Date(bookingData.startDate).toLocaleDateString()}</li>
          <li><strong>Duration:</strong> ${bookingData.duration} month(s)</li>
          <li><strong>Total Price:</strong> AED ${bookingData.totalPrice}</li>
          <li><strong>Booking Reference:</strong> ${booking.id.slice(0, 8).toUpperCase()}</li>
        </ul>
        
        <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="color: #28a745; margin-top: 0;">✅ Next Steps:</h3>
          <p>• We will contact you within <strong>2 working days</strong> to confirm availability</p>
          <p>• You will receive a payment link after confirmation</p>
          <p>• <strong>No charges have been made at this time</strong></p>
        </div>
        
        <p>If you have any questions, please contact us at digisurf777@gmail.com</p>
        <p>Best regards,<br>The Parking Team</p>
      `,
    });

    console.log('User confirmation sent:', userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        message: "Booking request submitted successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in submit-booking-request function:", error);
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