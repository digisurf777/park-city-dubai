import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  userEmail: string;
  fullName: string;
  documentType: string;
  documentUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, fullName, documentType, documentUrl }: VerificationEmailRequest = await req.json();

    const documentTypeFormatted = documentType.replace('_', ' ').toUpperCase();

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <digisurf7777@gmail.com>",
      to: ["dgsarp777@gmail.com"],
      subject: "New User Verification Submission",
      html: `
        <h1>New User Verification Submission</h1>
        <p>A user has submitted documents for verification:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>User Details:</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Document Type:</strong> ${documentTypeFormatted}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #856404;">⚠️ SECURITY NOTICE</h3>
          <p style="color: #856404;"><strong>Document access has been secured.</strong></p>
          <p style="color: #856404;">Direct document URLs have been removed from this email for security reasons.</p>
          <p style="color: #856404;">Please access documents through the secure admin panel using time-limited access tokens.</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Log in to the admin panel</li>
            <li>Navigate to the verification section</li>
            <li>Use the secure document viewer for this verification</li>
            <li>Review and update the verification status</li>
          </ol>
        </div>
        
        <p>Please review the document and update the verification status in the admin panel.</p>
        
        <hr style="margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">
          This is an automated email from the Parking App verification system.
        </p>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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