import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationApprovalRequest {
  userId: string;
  userEmail: string;
  userName: string;
  isApproved: boolean; // true for approved, false for rejected
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userEmail, userName, isApproved }: VerificationApprovalRequest = await req.json();
    
    console.log(`Processing verification ${isApproved ? 'approval' : 'rejection'} for user ${userName} (${userEmail})`);

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let subject = "";
    let htmlContent = "";
    let inboxMessage = "";

    if (isApproved) {
      subject = "ID Verification Approved";
      inboxMessage = "Congratulations! Your ID has been successfully verified. You can now list your parking space on the platform.";
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Verification Approved!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; border: 1px solid #c3e6cb; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px 0; color: #155724;">Dear ${userName},</h2>
                <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                  Congratulations! Your ID has been successfully verified. You can now list your parking space on the platform.
                </p>
              </div>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0; display: flex; align-items: center;">
                🚗 What You Can Do Now:
              </h3>
              <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                <li>List your parking space for monthly rentals</li>
                <li>Set your own pricing and availability</li>
                <li>Start earning passive income from your unused parking bay</li>
                <li>Access all premium features of ShazamParking</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://shazamparking.ae/rent-out-your-space" 
                 style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                🏢 List Your Parking Space Now
              </a>
            </div>

            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #495057; margin-top: 0;">Need Help?</h4>
              <p style="margin: 10px 0; color: #6c757d; line-height: 1.6;">
                If you have any questions about listing your parking space, our support team is here to help. 
                You can contact us through your account dashboard or reply to this email.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;" />
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email from ShazamParking. You're receiving this because your ID verification was processed.
            </p>
          </div>
        </div>
      `;
    } else {
      subject = "ID Verification - Additional Information Required";
      inboxMessage = "Your ID verification requires additional review. Please ensure your document is clear and readable, then submit again.";
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📋 Additional Information Required</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; border: 1px solid #f5c6cb; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; color: #721c24;">Dear ${userName},</h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                Your ID verification requires additional review. Please ensure your document is clear and readable, then submit again.
              </p>
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <h3 style="color: #856404; margin-top: 0;">📝 Tips for Successful Verification:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8; color: #856404;">
                <li>Ensure the document is well-lit and all text is clearly readable</li>
                <li>Include both sides of your ID if applicable</li>
                <li>Make sure there's no glare or shadows on the document</li>
                <li>Use a high-resolution image (not blurry)</li>
                <li>Ensure all corners of the document are visible</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://shazamparking.ae/my-account" 
                 style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">
                🔄 Submit New Verification
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;" />
            <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email from ShazamParking. You're receiving this because your ID verification was processed.
            </p>
          </div>
        </div>
      `;
    }

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "ShazamParking <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Verification notification email sent successfully:", emailResponse);

    // Insert message into user inbox
    const { error: messageError } = await supabase
      .from('user_messages')
      .insert({
        user_id: userId,
        from_admin: true,
        subject: subject,
        message: inboxMessage,
        read_status: false
      });

    if (messageError) {
      console.error("Error inserting inbox message:", messageError);
      throw messageError;
    }

    console.log("Inbox message created successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse, 
      inboxMessageCreated: true 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-approval function:", error);
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