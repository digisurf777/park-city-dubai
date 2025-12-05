import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
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
  listingId?: string | null;
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
      listingId,
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

    // Calculate end date (parse as local date without timezone conversion)
    const startDateObj = new Date(startDate + 'T00:00:00');
    const endDateObj = new Date(startDate + 'T00:00:00');
    endDateObj.setMonth(endDateObj.getMonth() + duration);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    // Insert booking into database using service role to bypass RLS
    const { data: booking, error: insertError } = await supabaseServiceClient
      .from("parking_bookings")
      .insert([
        {
          user_id: user.id,
          start_time: startDate,
          end_time: endDateStr,
          duration_hours: duration * 24 * 30, // Convert months to hours (approximate)
          zone,
          location,
          cost_aed: costAed,
          status: "pending",
          listing_id: listingId || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insertion error:", insertError);
      throw new Error(`Failed to save booking: ${insertError.message}`);
    }

    console.log("Booking saved successfully:", booking.id);

    // Create pre-authorization using direct fetch (no JWT needed)
    console.log("Creating pre-authorization...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const preAuthResponse = await fetch(`${supabaseUrl}/functions/v1/create-pre-authorization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        bookingId: booking.id,
        amount: costAed,
        securityDeposit: 0, // No security deposit
        duration: duration,
        parkingSpotName: parkingSpotName,
        userEmail: user.email,
        authorizationHoldDays: 7
      })
    });

    const paymentData = await preAuthResponse.json();
    const paymentError = !preAuthResponse.ok ? new Error(paymentData.error || 'Pre-authorization failed') : null;

    if (paymentError) {
      console.error("Pre-authorization creation failed:", paymentError);
      throw new Error("Failed to create pre-authorization");
    }
    console.log("Pre-authorization created:", paymentData.payment_url);

    // Send admin booking notification using dedicated function  
    const customerName = userProfile?.full_name || "Customer";
    const customerPhone = userPhone || userProfile?.phone || "Not provided";
    
    // Track email statuses
    let adminEmailSent = false;
    let bookingReceivedEmailSent = false;
    let customerEmailSent = false;
    let customerEmailError: string | null = null;
    
    // Also update notification calls to use service client with proper JWT headers
    try {
      console.log(`📧 Sending admin notification for booking ${booking.id}...`);
      const { error: adminNotificationError } = await supabaseServiceClient.functions.invoke('send-admin-booking-notification', {
        body: {
          userName: customerName,
          userEmail: user.email,
          userPhone: customerPhone,
          bookingId: booking.id,
          parkingSpotName: parkingSpotName,
          zone: zone,
          location: location,
          startDate: startDate,
          endDate: endDateStr,
          duration: duration,
          totalCost: costAed,
          paymentType: 'pre_authorization',
          notes: notes,
        }
      });

      if (adminNotificationError) {
        console.error("❌ Admin booking notification failed:", adminNotificationError);
      } else {
        console.log("✅ Admin booking notification sent successfully");
        adminEmailSent = true;
      }
    } catch (notificationError) {
      console.error("❌ Admin booking notification error:", notificationError);
      // Don't fail the booking if admin notification fails
    }

    // Send "Booking Request Received" email to customer
    try {
      console.log(`📧 Sending booking received email to ${user.email}...`);
      const { error: bookingReceivedError } = await supabaseServiceClient.functions.invoke('send-booking-received', {
        body: {
          userEmail: user.email,
          userName: customerName,
          bookingDetails: {
            location: `${parkingSpotName}, ${location}`,
            startDate: new Date(startDate).toLocaleDateString(),
            endDate: endDateObj.toLocaleDateString(),
            amount: `${costAed} AED`
          }
        }
      });

      if (bookingReceivedError) {
        console.error("❌ Booking received notification failed:", bookingReceivedError);
      } else {
        console.log("✅ Booking received notification sent successfully to", user.email);
        bookingReceivedEmailSent = true;
      }
    } catch (notificationError) {
      console.error("❌ Booking received notification error:", notificationError);
      // Don't fail the booking if notification fails
    }

    // Send enhanced confirmation email to customer with payment link
    console.log(`📧 Sending detailed confirmation email to ${user.email}...`);
    try {
      // Prepare inline logo for reliable rendering in email clients
      let logoFile: Uint8Array | null = null;
      try {
        logoFile = await Deno.readFile(new URL('./email-logo.png', import.meta.url));
      } catch (e) {
        console.warn('⚠️ Email logo file not found or unreadable:', e);
      }

      const customerEmailResponse = await resend.emails.send({
        from: "ShazamParking <noreply@shazamparking.ae>",
        to: [user.email],
        subject: "Complete Your Parking Booking Payment - ShazamParking",
        attachments: logoFile
          ? [{
              filename: 'logo.png',
              // Resend accepts Buffer/Uint8Array in Deno
              content: logoFile as unknown as Uint8Array,
              contentType: 'image/png',
              contentId: 'shazam_logo',
              disposition: 'inline',
            }]
          : undefined,
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
                        <td style="padding: 20px; text-align: center; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px;">
                          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Booking Confirmation</h1>
                          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">ShazamParking</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 40px; text-align: left;">
                          <h2 style="color: #333333; margin-top: 0;">Dear ${customerName}! 👋</h2>
                          <p style="font-size: 16px; color: #555555; line-height: 1.6;">
                            Thank you for choosing ShazamParking! Your booking request has been received and we've created a secure payment link for you.
                          </p>

                          ${costAed < 2 ? `
                          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="color: #856404; font-weight: bold; margin: 0;">💳 Payment Processing Notice:</p>
                            <p style="color: #856404; margin: 5px 0 0 0;">
                              Your original booking amount was ${costAed} AED. Due to payment processor requirements (minimum 2 AED), the payment authorization will show 2 AED. However, you will only be charged the actual booking amount (${costAed} AED) once your booking is confirmed by our team.
                            </p>
                          </div>
                          ` : ''}

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
                              <tr><td><strong>Start Date:</strong></td><td>${startDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                              <tr><td><strong>End Date:</strong></td><td>${endDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                              <tr><td><strong>Duration:</strong></td><td>${duration} month(s)</td></tr>
                              <tr><td><strong>Total Cost:</strong></td><td>${costAed} AED</td></tr>
                              <tr><td><strong>Payment Type:</strong></td><td>Pre-Authorization</td></tr>
                              ${notes ? `<tr><td><strong>Notes:</strong></td><td>${notes}</td></tr>` : ''}
                            </table>
                          </div>
                          
                          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <h3 style="color: #1e40af; margin-top: 0;">Complete Your Payment Authorization</h3>
                            <p style="color: #1e40af; margin-bottom: 15px;">Your payment will be pre-authorized (not charged immediately). We will confirm your booking shortly.</p>
                            <a href="${paymentData.payment_url}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Authorize Payment</a>
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
                              <li>If approved, your pre-authorized payment will be captured</li>
                              <li>If not approved, you'll receive a full refund automatically</li>
                            </ol>
                          </div>
                          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #0c5460; margin: 0;">
              <strong>📞 Need Help?</strong><br>
              Contact us at <a href="mailto:support@shazamparking.ae" style="color: #0099cc;">support@shazamparking.ae</a>
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
        console.error("❌ Customer email error:", customerEmailResponse.error);
        customerEmailError = customerEmailResponse.error.message || "Unknown error";
      } else {
        console.log("✅ Customer confirmation email sent successfully to", user.email);
        console.log("📧 Email ID:", customerEmailResponse.data?.id);
        customerEmailSent = true;
      }
    } catch (emailError) {
      console.error("❌ Customer email exception:", emailError);
      customerEmailError = emailError instanceof Error ? emailError.message : "Unknown error";
    }

    // Update booking with email delivery status
    try {
      const { error: updateError } = await supabaseServiceClient
        .from("parking_bookings")
        .update({
          customer_email_sent: customerEmailSent,
          customer_email_sent_at: customerEmailSent ? new Date().toISOString() : null,
          customer_email_error: customerEmailError,
          admin_email_sent: adminEmailSent,
          admin_email_sent_at: adminEmailSent ? new Date().toISOString() : null,
          booking_received_email_sent: bookingReceivedEmailSent,
          booking_received_email_sent_at: bookingReceivedEmailSent ? new Date().toISOString() : null,
        })
        .eq("id", booking.id);

      if (updateError) {
        console.error("❌ Failed to update email status:", updateError);
      } else {
        console.log("✅ Email delivery status tracked in database");
      }
    } catch (trackingError) {
      console.error("❌ Email tracking error:", trackingError);
    }

    // Log final email delivery summary
    console.log("📊 Email Delivery Summary for booking", booking.id);
    console.log("   - Admin email:", adminEmailSent ? "✅ Sent" : "❌ Failed");
    console.log("   - Booking received email:", bookingReceivedEmailSent ? "✅ Sent" : "❌ Failed");
    console.log("   - Customer confirmation email:", customerEmailSent ? "✅ Sent" : "❌ Failed");
    if (customerEmailError) {
      console.log("   - Customer email error:", customerEmailError);
    }

    // Return response with email status
    if (!customerEmailSent) {
      return new Response(
        JSON.stringify({
          success: true,
          bookingId: booking.id,
          paymentUrl: paymentData.payment_url,
          warning: "Booking created but confirmation email failed. Please save your booking reference: " + booking.id,
          message: "Booking request submitted successfully. Please complete your payment setup to secure your parking space.",
          emailStatus: {
            customerEmail: false,
            adminEmail: adminEmailSent,
            bookingReceivedEmail: bookingReceivedEmailSent,
            error: customerEmailError
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        paymentUrl: paymentData.payment_url,
        message: "Booking request submitted successfully. Please complete your payment authorization to secure your parking space.",
        emailStatus: {
          customerEmail: customerEmailSent,
          adminEmail: adminEmailSent,
          bookingReceivedEmail: bookingReceivedEmailSent
        }
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