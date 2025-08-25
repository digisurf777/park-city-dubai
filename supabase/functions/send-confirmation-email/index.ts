import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  fullName: string;
  confirmationUrl: string;
  language?: 'en' | 'ar';
  isResend?: boolean;
}

// Rate limiting storage - in production, use Redis or similar
const emailSendAttempts = new Map<string, { count: number; lastAttempt: number }>();

const getRateLimitInfo = (email: string) => {
  const now = Date.now();
  const attempts = emailSendAttempts.get(email);
  
  if (!attempts || now - attempts.lastAttempt > 3600000) { // 1 hour
    emailSendAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingTime: 0 };
  }
  
  if (attempts.count >= 3) { // Max 3 emails per hour
    const remainingTime = Math.ceil((3600000 - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true, remainingTime: 0 };
};

const getEmailTemplate = (fullName: string, confirmationUrl: string, language: 'en' | 'ar' = 'en') => {
  const templates = {
    en: {
      subject: "Confirm Your Email – ShazamParking",
      html: `
        <!DOCTYPE html>
        <html lang="en" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>Confirm your email</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #10b981, #059669);">
                        <img src="https://raw.githubusercontent.com/lovable-uploads/60835aae-0ac3-413a-9e3c-a64be4d1c4ae.png" alt="Shazam Parking Logo" width="120" style="margin-bottom: 10px;" />
                        <h1 style="color: white; font-size: 28px; margin: 15px 0 0 0; font-weight: bold;">Welcome to ShazamParking!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 40px 30px 40px; text-align: left;">
                        <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Confirm Your Email Address</h2>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 15px 0;">
                          Hello <strong>${fullName}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                          Thank you for joining ShazamParking! We're excited to help you find and book parking spaces across Dubai.
                        </p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                          To activate your account and start using our services, please confirm your email address by clicking the button below:
                        </p>
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${confirmationUrl}" target="_blank" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                            ✓ Confirm Email Address
                          </a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin: 30px 0 0 0;">
                          If the button doesn't work, copy and paste this link into your browser:<br>
                          <a href="${confirmationUrl}" style="color: #10b981; word-break: break-all;">${confirmationUrl}</a>
                        </p>
                        <p style="font-size: 14px; color: #9ca3af; line-height: 1.5; margin: 20px 0 0 0;">
                          If you didn't create this account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0;">
                          Need help? Contact us at <a href="mailto:support@shazamparking.ae" style="color: #10b981;">support@shazamparking.ae</a>
                        </p>
                        <p style="margin: 0;">
                          Best regards,<br />
                          <strong>The ShazamParking Team</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    },
    ar: {
      subject: "تأكيد البريد الإلكتروني – شزام باركنج",
      html: `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl" style="font-family: Arial, sans-serif;">
          <head>
            <meta charset="UTF-8" />
            <title>تأكيد البريد الإلكتروني</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #10b981, #059669);">
                        <img src="https://raw.githubusercontent.com/lovable-uploads/60835aae-0ac3-413a-9e3c-a64be4d1c4ae.png" alt="شعار شزام باركنج" width="120" style="margin-bottom: 10px;" />
                        <h1 style="color: white; font-size: 28px; margin: 15px 0 0 0; font-weight: bold;">مرحباً بك في شزام باركنج!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 40px 30px 40px; text-align: right;">
                        <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">تأكيد عنوان البريد الإلكتروني</h2>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.8; margin: 0 0 15px 0;">
                          مرحباً <strong>${fullName}</strong>،
                        </p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.8; margin: 0 0 20px 0;">
                          شكراً لانضمامك إلى شزام باركنج! نحن متحمسون لمساعدتك في العثور على أماكن وقوف السيارات وحجزها في جميع أنحاء دبي.
                        </p>
                        <p style="font-size: 16px; color: #4b5563; line-height: 1.8; margin: 0 0 30px 0;">
                          لتفعيل حسابك والبدء في استخدام خدماتنا، يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه:
                        </p>
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${confirmationUrl}" target="_blank" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                            ✓ تأكيد البريد الإلكتروني
                          </a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 30px 0 0 0;">
                          إذا لم يعمل الزر، انسخ والصق هذا الرابط في متصفحك:<br>
                          <a href="${confirmationUrl}" style="color: #10b981; word-break: break-all;">${confirmationUrl}</a>
                        </p>
                        <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 20px 0 0 0;">
                          إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0;">
                          تحتاج مساعدة؟ تواصل معنا على <a href="mailto:support@shazamparking.ae" style="color: #10b981;">support@shazamparking.ae</a>
                        </p>
                        <p style="margin: 0;">
                          مع أطيب التحيات،<br />
                          <strong>فريق شزام باركنج</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    }
  };
  
  return templates[language];
};

const retryEmailSend = async (emailData: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData);
      
      if (result.error) {
        console.error(`Email send attempt ${attempt} failed:`, result.error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to send email after ${maxRetries} attempts: ${result.error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      return result;
    } catch (error) {
      console.error(`Email send attempt ${attempt} error:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, confirmationUrl, language = 'en', isResend = false }: ConfirmationEmailRequest = await req.json();
    
    console.log('Processing confirmation email request:', { email, fullName, language, isResend });
    
    // Validate required fields
    if (!email || !fullName || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, fullName, confirmationUrl' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check rate limiting
    const rateLimitInfo = getRateLimitInfo(email);
    if (!rateLimitInfo.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before requesting another email.',
          remainingTime: rateLimitInfo.remainingTime
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get email template based on language preference
    const template = getEmailTemplate(fullName, confirmationUrl, language);
    
    // Prepare email data
    const emailData = {
      from: "ShazamParking <noreply@shazamparking.ae>",
      to: [email],
      subject: template.subject,
      html: template.html,
    };

    console.log('Sending confirmation email to:', email);
    
    // Send email with retry logic
    const emailResponse = await retryEmailSend(emailData);

    console.log("Confirmation email sent successfully:", {
      id: emailResponse.data?.id,
      email,
      language,
      isResend
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      message: isResend ? 'Confirmation email resent successfully' : 'Confirmation email sent successfully',
      language
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
    // Return different error messages based on error type
    let errorMessage = 'Failed to send confirmation email';
    let statusCode = 500;
    
    if (error.message?.includes('Rate limit')) {
      errorMessage = 'Too many email requests. Please wait before trying again.';
      statusCode = 429;
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Invalid email address provided';
      statusCode = 400;
    } else if (error.message?.includes('RESEND_API_KEY')) {
      errorMessage = 'Email service configuration error';
      statusCode = 503;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);