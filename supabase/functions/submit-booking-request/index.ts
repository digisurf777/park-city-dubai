import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface BookingRequest {
  startDate: string;
  duration: number;
  userPhone?: string;
  notes?: string;
  zone: string;
  location: string;
  costAed: number;
  parkingSpotName: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting booking submission process...");

    // Initialize Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Initialize Supabase service client for database operations (bypasses RLS)
    const supabaseServiceClient = createClient(
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

    const {
      startDate,
      duration,
      userPhone,
      notes,
      zone,
      location,
      costAed,
      parkingSpotName,
    }: BookingRequest = await req.json();

    console.log("Booking data received:", { startDate, duration, zone, location, costAed });

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    // Insert booking into database using service role to bypass RLS
    const { data: booking, error: insertError } = await supabaseServiceClient
      .from("parking_bookings")
      .insert([
        {
          user_id: user.id,
          start_time: startDate,
          end_time: endDate.toISOString(),
          duration_hours: duration * 24 * 30, // Convert months to hours (approximate)
          zone,
          location,
          cost_aed: costAed,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insertion error:", insertError);
      throw new Error(`Failed to save booking: ${insertError.message}`);
    }

    console.log("Booking saved successfully:", booking.id);

    // Create payment link using the new edge function
    console.log("Creating payment link...");
    
    const paymentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/create-payment-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        bookingId: booking.id,
        amount: costAed,
        duration: duration,
        parkingSpotName: parkingSpotName,
        userEmail: user.email,
      }),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Payment link creation failed:", errorText);
      throw new Error("Failed to create payment link");
    }

    const paymentData = await paymentResponse.json();
    console.log("Payment link created:", paymentData.payment_url);

    // Send confirmation email to admin with payment details
    const adminEmailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.com>",
      to: ["shazamparkingdubai@gmail.com"],
      subject: "New Parking Booking with Payment Link",
      html: `
        <h2>New Parking Booking Request</h2>
        <p><strong>Reference:</strong> ${booking.id}</p>
        <p><strong>Customer:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${userPhone || "Not provided"}</p>
        <p><strong>Parking Spot:</strong> ${parkingSpotName}</p>
        <p><strong>Zone:</strong> ${zone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${duration} month(s)</p>
        <p><strong>Total Cost:</strong> ${costAed} AED</p>
        <p><strong>Payment Type:</strong> ${paymentData.payment_type === 'one_time' ? 'One-time Payment' : 'Monthly Recurring'}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <p><strong>Status:</strong> Payment Link Sent</p>
        <p><strong>Confirmation Deadline:</strong> ${new Date(paymentData.confirmation_deadline).toLocaleDateString()}</p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="color: #92400e; font-weight: bold; margin: 0;">⚠️ Action Required:</p>
          <p style="color: #92400e; margin: 5px 0 0 0;">Customer has been sent a payment link. You have 2 days to confirm or reject this booking in the admin panel.</p>
        </div>
        
        <p><a href="${req.headers.get("origin")}/admin" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Panel</a></p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error:", adminEmailResponse.error);
    } else {
      console.log("Admin notification sent successfully");
    }

    // Send enhanced confirmation email to customer with payment link
    const customerEmailResponse = await resend.emails.send({
      from: "ShazamParking <noreply@shazamparking.com>",
      to: [user.email],
      subject: "Complete Your Parking Booking Payment",
      html: `
        <h2>Complete Your Parking Booking</h2>
        <p>Dear valued customer,</p>
        <p>Thank you for choosing ShazamParking! Your booking request has been received and we've created a secure payment link for you.</p>
        
        <h3>Booking Details:</h3>
        <p><strong>Reference Number:</strong> ${booking.id}</p>
        <p><strong>Parking Spot:</strong> ${parkingSpotName}</p>
        <p><strong>Zone:</strong> ${zone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${duration} month(s)</p>
        <p><strong>Total Cost:</strong> ${costAed} AED</p>
        <p><strong>Payment Type:</strong> ${paymentData.payment_type === 'one_time' ? 'One-time Payment' : 'Monthly Recurring Payments'}</p>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #1e40af; margin-top: 0;">Complete Your Payment</h3>
          ${paymentData.payment_type === 'one_time' 
            ? '<p style="color: #1e40af; margin-bottom: 15px;">Your payment will be pre-authorized (not charged immediately). We will confirm your booking within 2 days.</p>'
            : '<p style="color: #1e40af; margin-bottom: 15px;">Set up your monthly subscription with a 2-day trial period. Billing starts after we confirm your booking.</p>'
          }
          <a href="${paymentData.payment_url}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Complete Payment Setup</a>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="color: #92400e; font-weight: bold; margin: 0;">⏰ Important Timeline:</p>
          <p style="color: #92400e; margin: 5px 0 0 0;">
            • Complete payment setup as soon as possible<br>
            • We will review and confirm your booking within 2 business days<br>
            • If not confirmed by ${new Date(paymentData.confirmation_deadline).toLocaleDateString()}, the payment will be automatically refunded
          </p>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Complete your payment setup using the link above</li>
          <li>Our team will review your booking request</li>
          <li>You'll receive confirmation within 2 business days</li>
          <li>If approved, ${paymentData.payment_type === 'one_time' ? 'your payment will be processed' : 'your subscription will begin'}</li>
          <li>If not approved, you'll receive a full refund automatically</li>
        </ul>
        
        <p>If you have any questions, please contact us at shazamparkingdubai@gmail.com</p>
        
        <p>Thank you for choosing ShazamParking!</p>
        <p>Best regards,<br>The ShazamParking Team</p>
      `,
    });

    if (customerEmailResponse.error) {
      console.error("Customer email error:", customerEmailResponse.error);
    } else {
      console.log("Customer confirmation sent successfully");
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        paymentUrl: paymentData.payment_url,
        paymentType: paymentData.payment_type,
        confirmationDeadline: paymentData.confirmation_deadline,
        message: "Booking request submitted successfully. Please complete your payment setup to secure your parking space.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in submit-booking-request:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);