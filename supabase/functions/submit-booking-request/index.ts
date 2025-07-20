
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
    console.log('=== Booking request function started ===');

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('Email service not configured');
    }
    console.log('RESEND_API_KEY is configured');

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
    console.log('Received booking data:', JSON.stringify(bookingData, null, 2));

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
        zone: "Product Page",
        start_time: bookingData.startDate,
        end_time: endDate.toISOString(),
        duration_hours: bookingData.duration * 30 * 24, // Approximate hours for months
        cost_aed: bookingData.totalPrice,
        status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    console.log('Booking created successfully:', booking);

    // Generate booking reference
    const bookingReference = booking.id.slice(0, 8).toUpperCase();

    // Send notification email to admin with confirm/deny buttons
    console.log('Sending admin notification email to support@shazam.ae...');
    const adminEmailResponse = await resend.emails.send({
      from: "Shazam Parking <bookings@shazam.ae>",
      to: ["support@shazam.ae"],
      subject: `🚗 New Booking Request #${bookingReference} - ${bookingData.parkingSpotName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>New Booking Request</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background-color: #0099cc; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; }
              .booking-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .customer-info { background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .action-buttons { text-align: center; margin: 30px 0; }
              .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; color: white; }
              .btn-confirm { background-color: #28a745; }
              .btn-deny { background-color: #dc3545; }
              .btn:hover { opacity: 0.9; }
              .notes { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
              .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #6c757d; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 New Booking Request</h1>
                <p>Reference: #${bookingReference}</p>
              </div>
              
              <div class="content">
                <h2>Parking Space Booking Request</h2>
                
                <div class="booking-details">
                  <h3>📍 Booking Details</h3>
                  <ul>
                    <li><strong>Parking Space:</strong> ${bookingData.parkingSpotName}</li>
                    <li><strong>Start Date:</strong> ${new Date(bookingData.startDate).toLocaleDateString('en-GB')}</li>
                    <li><strong>Duration:</strong> ${bookingData.duration} month(s)</li>
                    <li><strong>End Date:</strong> ${endDate.toLocaleDateString('en-GB')}</li>
                    <li><strong>Total Price:</strong> AED ${bookingData.totalPrice.toLocaleString()}</li>
                    <li><strong>Status:</strong> Pending Confirmation</li>
                  </ul>
                </div>

                <div class="customer-info">
                  <h3>👤 Customer Information</h3>
                  <ul>
                    <li><strong>Name:</strong> ${bookingData.userName}</li>
                    <li><strong>Email:</strong> ${bookingData.userEmail}</li>
                    <li><strong>Phone:</strong> ${bookingData.userPhone || 'Not provided'}</li>
                    <li><strong>User ID:</strong> ${user.id}</li>
                  </ul>
                </div>

                ${bookingData.notes ? `
                <div class="notes">
                  <h3>📝 Additional Notes</h3>
                  <p>${bookingData.notes}</p>
                </div>
                ` : ''}

                <div class="action-buttons">
                  <h3>⚡ Quick Actions Required</h3>
                  <p>Please confirm availability and contact the customer within <strong>2 working days</strong>.</p>
                  
                  <a href="mailto:${bookingData.userEmail}?subject=Booking Confirmed - ${bookingData.parkingSpotName} (Ref: ${bookingReference})&body=Dear ${bookingData.userName},%0D%0A%0D%0AGreat news! Your parking space booking has been confirmed.%0D%0A%0D%0ABooking Details:%0D%0A- Space: ${bookingData.parkingSpotName}%0D%0A- Start Date: ${new Date(bookingData.startDate).toLocaleDateString('en-GB')}%0D%0A- Duration: ${bookingData.duration} month(s)%0D%0A- Total: AED ${bookingData.totalPrice}%0D%0A- Reference: ${bookingReference}%0D%0A%0D%0ANext Steps:%0D%0A1. Payment link will be sent separately%0D%0A2. Access details will be provided after payment%0D%0A%0D%0ABest regards,%0D%0AShazam Parking Team" 
                     class="btn btn-confirm">✅ Confirm Booking</a>
                  
                  <a href="mailto:${bookingData.userEmail}?subject=Booking Unavailable - ${bookingData.parkingSpotName} (Ref: ${bookingReference})&body=Dear ${bookingData.userName},%0D%0A%0D%0AThank you for your booking request. Unfortunately, the parking space is not available for your requested dates.%0D%0A%0D%0ABooking Details:%0D%0A- Space: ${bookingData.parkingSpotName}%0D%0A- Requested Start Date: ${new Date(bookingData.startDate).toLocaleDateString('en-GB')}%0D%0A- Duration: ${bookingData.duration} month(s)%0D%0A- Reference: ${bookingReference}%0D%0A%0D%0AWe'd be happy to help you find alternative dates or suggest similar parking spaces in the area.%0D%0A%0D%0ABest regards,%0D%0AShazam Parking Team" 
                     class="btn btn-deny">❌ Decline Booking</a>
                </div>

                <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #0c5460; margin-top: 0;">📞 Customer Contact Instructions:</h4>
                  <ol style="color: #0c5460;">
                    <li>Click the appropriate action button above to send a pre-formatted email</li>
                    <li>If confirming, send payment link and access instructions</li>
                    <li>Update booking status in the admin panel</li>
                    <li>If phone contact is needed: ${bookingData.userPhone || 'No phone provided'}</li>
                  </ol>
                </div>
              </div>

              <div class="footer">
                <p>This booking request was submitted through ShazamParking.ae<br>
                Admin Panel: <a href="https://preview--park-city-dubai.lovable.app/admin">https://preview--park-city-dubai.lovable.app/admin</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin notification email response:', adminEmailResponse);
    
    if (adminEmailResponse.error) {
      console.error('Error sending admin email:', adminEmailResponse.error);
      // Don't throw error here, continue with user email
    } else {
      console.log('✅ Admin notification sent successfully to support@shazam.ae');
    }

    // Send confirmation email to user
    console.log('Sending user confirmation email...');
    const userEmailResponse = await resend.emails.send({
      from: "Shazam Parking <bookings@shazam.ae>",
      to: [bookingData.userEmail],
      subject: `Booking Request Received #${bookingReference} - ${bookingData.parkingSpotName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Booking Request Received</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background-color: #0099cc; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; }
              .booking-summary { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .next-steps { background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
              .footer { text-align: center; padding: 20px; background-color: #f8f9fa; color: #6c757d; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Booking Request Received!</h1>
                <p>Reference: #${bookingReference}</p>
              </div>
              
              <div class="content">
                <p>Hello <strong>${bookingData.userName}</strong>,</p>
                <p>Thank you for your parking space booking request. We have received your submission and our team will review it shortly.</p>

                <div class="booking-summary">
                  <h3>📋 Your Booking Details</h3>
                  <ul>
                    <li><strong>Parking Space:</strong> ${bookingData.parkingSpotName}</li>
                    <li><strong>Start Date:</strong> ${new Date(bookingData.startDate).toLocaleDateString('en-GB')}</li>
                    <li><strong>Duration:</strong> ${bookingData.duration} month(s)</li>
                    <li><strong>Total Price:</strong> AED ${bookingData.totalPrice.toLocaleString()}</li>
                    <li><strong>Booking Reference:</strong> #${bookingReference}</li>
                  </ul>
                </div>
                
                <div class="next-steps">
                  <h3 style="color: #155724; margin-top: 0;">🚀 What Happens Next:</h3>
                  <ul style="color: #155724;">
                    <li>We will contact you within <strong>2 working days</strong> to confirm availability</li>
                    <li>You will receive a payment link after confirmation</li>
                    <li><strong>No charges have been made at this time</strong></li>
                    <li>Access details will be provided after payment confirmation</li>
                  </ul>
                </div>

                <p>If you have any questions about your booking, please contact us at <a href="mailto:support@shazam.ae">support@shazam.ae</a> and include your booking reference <strong>#${bookingReference}</strong>.</p>
                
                <p>Best regards,<br><strong>The Shazam Parking Team</strong></p>
              </div>

              <div class="footer">
                <p>You're receiving this email because you submitted a parking booking request on ShazamParking.ae<br>
                If you didn't make this request, please contact us immediately at support@shazam.ae</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('User confirmation email response:', userEmailResponse);
    
    if (userEmailResponse.error) {
      console.error('Error sending user email:', userEmailResponse.error);
    } else {
      console.log('✅ User confirmation sent successfully');
    }

    console.log('=== Booking request function completed successfully ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        bookingReference: bookingReference,
        message: "Booking request submitted successfully",
        emailStatus: {
          adminEmail: adminEmailResponse.error ? 'failed' : 'sent',
          userEmail: userEmailResponse.error ? 'failed' : 'sent'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("=== Error in submit-booking-request function ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Please check the function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
