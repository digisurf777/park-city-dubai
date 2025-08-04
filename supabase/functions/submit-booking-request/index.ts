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
  costAed: number; // First month payment only
  monthlyRate: number; // Monthly rate for subscription
  totalCommitment: number; // Total commitment amount
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
      monthlyRate,
      totalCommitment,
      parkingSpotName,
    }: BookingRequest = await req.json();

    console.log("Booking data received:", { startDate, duration, zone, location, costAed });

    // Get user profile information for enhanced email
    const { data: userProfile, error: profileError } = await supabaseServiceClient
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user.id)
      .single();
    
    if (profileError) {
      console.log("Profile fetch error (will continue without profile data):", profileError);
    }

    console.log("User profile data:", userProfile);

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
        amount: costAed, // First month payment
        monthlyRate: monthlyRate, // Monthly subscription rate
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
    const customerName = userProfile?.full_name || "Customer";
    const customerPhone = userPhone || userProfile?.phone || "Not provided";
    
    const adminEmailResponse = await resend.emails.send({
      from: "ShazamParking <onboarding@resend.dev>",
      to: ["shazamparkingdubai@gmail.com"],
      subject: "New Parking Booking with Payment Link",
      html: `
        <h2>New Parking Booking Request</h2>
        <p><strong>Reference:</strong> ${booking.id}</p>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Customer Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Parking Spot:</strong> ${parkingSpotName}</p>
        <p><strong>Zone:</strong> ${zone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${duration} month(s)</p>
        <p><strong>First Month Payment:</strong> ${costAed} AED</p>
        <p><strong>Monthly Rate:</strong> ${monthlyRate} AED/month</p>
        <p><strong>Total Commitment:</strong> ${totalCommitment} AED over ${duration} months</p>
        <p><strong>Payment Type:</strong> ${paymentData.payment_type === 'one_time' ? 'One-time Payment' : 'Monthly Recurring'}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <p><strong>Status:</strong> Payment Link Sent</p>
        
        <p><a href="${req.headers.get("origin")}/admin" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Panel</a></p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error("Admin email error:", adminEmailResponse.error);
      // Don't fail the booking if admin email fails
    } else {
      console.log("Admin notification sent successfully");
    }

    // Email 1: Booking Request Received (Pre-Authorization)
    const customerEmailResponse = await resend.emails.send({
      from: "ShazamParking <support@shazamparking.ae>",
      to: [user.email],
      subject: "Your Booking Request Has Been Received",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Booking Request Received</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: #0099cc;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="Shazam Parking Logo" width="140" style="margin-bottom: 10px;" />
                        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Request Received</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333; margin-top: 0;">Dear ${customerName},</h2>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Thank you for booking with ShazamParking.
                        </p>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          We've received your request and your payment card has been securely pre-authorized for the rental amount. 
                          <strong>Please note that this is not yet a confirmation of your booking.</strong>
                        </p>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          We are now contacting the space owner to verify availability. You will receive an update within 48 hours. 
                          If the space is confirmed, your card will be charged and your booking finalized. 
                          If it's no longer available, the pre-authorization will be released and no payment will be taken.
                        </p>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0099cc;">
                          <h3 style="color: #0099cc; margin-top: 0;">Booking Details:</h3>
                          <table style="width: 100%; color: #333;">
                            <tr><td><strong>Reference Number:</strong></td><td>${booking.id}</td></tr>
                            <tr><td><strong>Parking Spot:</strong></td><td>${parkingSpotName}</td></tr>
                            <tr><td><strong>Zone:</strong></td><td>${zone}</td></tr>
                            <tr><td><strong>Location:</strong></td><td>${location}</td></tr>
                            <tr><td><strong>Start Date:</strong></td><td>${new Date(startDate).toLocaleDateString()}</td></tr>
                            <tr><td><strong>Duration:</strong></td><td>${duration} month(s)</td></tr>
                            <tr><td><strong>Amount:</strong></td><td>${costAed} AED</td></tr>
                          </table>
                        </div>
                        
                        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                          <h3 style="color: #1e40af; margin-top: 0;">Complete Your Payment Setup</h3>
                          <p style="color: #1e40af; margin-bottom: 15px;">
                            Please complete your payment setup to secure your booking request.
                          </p>
                          <a href="${paymentData.payment_url}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Complete Payment Setup</a>
                        </div>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Thank you for choosing ShazamParking.
                        </p>
                        
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Best regards,<br>
                          The ShazamParking Team<br>
                          <a href="mailto:support@shazamparking.ae" style="color: #0099cc;">support@shazamparking.ae</a><br>
                          <a href="https://www.shazamparking.ae" style="color: #0099cc;">www.shazamparking.ae</a>
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

    if (customerEmailResponse.error) {
      console.error("Customer email error:", customerEmailResponse.error);
      // Log error but don't fail the booking
      return new Response(
        JSON.stringify({
          success: true,
          bookingId: booking.id,
          paymentUrl: paymentData.payment_url,
          paymentType: paymentData.payment_type,
          confirmationDeadline: paymentData.confirmation_deadline,
          warning: "Booking created successfully but confirmation email failed. Please save your booking reference: " + booking.id,
          message: "Booking request submitted successfully. Please complete your payment setup to secure your parking space.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
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