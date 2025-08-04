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

    // Send enhanced confirmation email to customer with payment link
    const customerEmailResponse = await resend.emails.send({
      from: "ShazamParking <onboarding@resend.dev>",
      to: [user.email],
      subject: "Complete Your Parking Booking Payment - ShazamParking",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Complete Your Parking Booking</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: #0099cc;">
                        <img src="https://shazamparking.ae/wp-content/uploads/2024/11/shazam-logo-blue.png" alt="Shazam Parking Logo" width="140" style="margin-bottom: 10px;" />
                        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmation</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: left;">
                        <h2 style="color: #333333; margin-top: 0;">Dear ${customerName}! 👋</h2>
                        <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                          Thank you for choosing ShazamParking! Your booking request has been received and we've created a secure payment link for you.
                        </p>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0099cc;">
                          <h3 style="color: #0099cc; margin-top: 0;">Booking Details:</h3>
                          <table style="width: 100%; color: #333;">
                            <tr><td><strong>Reference Number:</strong></td><td>${booking.id}</td></tr>
                            <tr><td><strong>Customer Name:</strong></td><td>${customerName}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${customerPhone}</td></tr>
                            <tr><td><strong>Parking Spot:</strong></td><td>${parkingSpotName}</td></tr>
                            <tr><td><strong>Zone:</strong></td><td>${zone}</td></tr>
                            <tr><td><strong>Location:</strong></td><td>${location}</td></tr>
                            <tr><td><strong>Start Date:</strong></td><td>${new Date(startDate).toLocaleDateString()}</td></tr>
                            <tr><td><strong>Duration:</strong></td><td>${duration} month(s)</td></tr>
                             <tr><td><strong>First Month Payment:</strong></td><td>${costAed} AED</td></tr>
                             <tr><td><strong>Monthly Rate:</strong></td><td>${monthlyRate} AED/month</td></tr>
                             <tr><td><strong>Total Commitment:</strong></td><td>${totalCommitment} AED over ${duration} months</td></tr>
                            <tr><td><strong>Payment Type:</strong></td><td>${paymentData.payment_type === 'one_time' ? 'One-time Payment' : 'Monthly Recurring Payments'}</td></tr>
                            ${notes ? `<tr><td><strong>Notes:</strong></td><td>${notes}</td></tr>` : ''}
                          </table>
                        </div>
                        
                        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                          <h3 style="color: #1e40af; margin-top: 0;">Complete Your Payment</h3>
                          ${paymentData.payment_type === 'one_time' 
                            ? '<p style="color: #1e40af; margin-bottom: 15px;">Your payment will be pre-authorized (not charged immediately). We will confirm your booking shortly.</p>'
                            : '<p style="color: #1e40af; margin-bottom: 15px;">Set up your monthly subscription. Billing starts after we confirm your booking.</p>'
                          }
                          <a href="${paymentData.payment_url}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Complete Payment Setup</a>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                          <p style="color: #92400e; font-weight: bold; margin: 0;">⏰ Important Timeline:</p>
                          <p style="color: #92400e; margin: 5px 0 0 0;">
                            • Complete payment setup as soon as possible<br>
                            • We will review and confirm your booking shortly<br>
                            • If not confirmed, the payment will be automatically refunded
                          </p>
                        </div>
                        
                        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <h3 style="color: #007bff; margin-top: 0;">What happens next?</h3>
                          <ol style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                            <li>Complete your payment setup using the link above</li>
                            <li>Our team will review your booking request</li>
                            <li>You'll receive confirmation shortly</li>
                            <li>If approved, ${paymentData.payment_type === 'one_time' ? 'your payment will be processed' : 'your subscription will begin'}</li>
                            <li>If not approved, you'll receive a full refund automatically</li>
                          </ol>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <p style="color: #0c5460; margin: 0;">
                            <strong>📞 Need Help?</strong><br>
                            Contact us at <a href="mailto:support@shazamparking.ae" style="color: #0099cc;">support@shazamparking.ae</a><br>
                            Call us: +971 XX XXX XXXX (Available 24/7)
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; text-align: center; font-size: 12px; color: #999999;">
                        Thank you for choosing ShazamParking!<br />
                        <br />
                        Best regards,<br />
                        <strong>The ShazamParking Team</strong>
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