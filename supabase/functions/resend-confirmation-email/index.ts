import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendConfirmationRequest {
  email: string;
  language?: 'en' | 'ar';
}

// Rate limiting storage
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();

const getRateLimitInfo = (email: string) => {
  const now = Date.now();
  const attempts = resendAttempts.get(email);
  
  if (!attempts || now - attempts.lastAttempt > 3600000) { // 1 hour
    resendAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingTime: 0 };
  }
  
  if (attempts.count >= 5) { // Max 5 resends per hour
    const remainingTime = Math.ceil((3600000 - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true, remainingTime: 0 };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, language = 'en' }: ResendConfirmationRequest = await req.json();
    
    console.log('Processing resend confirmation request:', { email, language });
    
    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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

    // Get user data from Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (userError || !userData?.user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found with this email address' }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if email is already confirmed
    if (userData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email is already confirmed' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user profile for full name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', userData.user.id)
      .single();

    const fullName = profile?.full_name || 'User';

    // Generate confirmation link with proper Supabase auth URL format
    const { data: linkData, error: resendError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: 'https://shazamparking.ae/email-confirmed?redirect_to=/my-account'
      }
    });

    if (resendError || !linkData?.properties?.action_link) {
      console.error('Failed to generate confirmation link:', resendError);
      throw new Error(`Failed to generate confirmation link: ${resendError?.message || 'No link generated'}`);
    }

    const confirmationUrl = linkData.properties.action_link;
    console.log('Generated confirmation URL:', confirmationUrl);
    
    // Call send-confirmation-email function to actually send the email
    const emailResponse = await supabaseAdmin.functions.invoke('send-confirmation-email', {
      body: {
        email: email,
        fullName: fullName,
        confirmationUrl: confirmationUrl,
        language: language,
        isResend: true
      }
    });

    if (emailResponse.error) {
      console.error('Failed to send confirmation email:', emailResponse.error);
      throw new Error(`Failed to send confirmation email: ${emailResponse.error.message}`);
    }

    console.log("Confirmation email resent successfully:", { email, language, emailId: emailResponse.data?.emailId });

    return new Response(JSON.stringify({
      success: true,
      message: 'Confirmation email resent successfully',
      language
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in resend-confirmation-email function:", error);
    
    let errorMessage = 'Failed to resend confirmation email';
    let statusCode = 500;
    
    if (error.message?.includes('Rate limit')) {
      errorMessage = 'Too many email requests. Please wait before trying again.';
      statusCode = 429;
    } else if (error.message?.includes('User not found')) {
      errorMessage = 'No account found with this email address';
      statusCode = 404;
    } else if (error.message?.includes('already confirmed')) {
      errorMessage = 'Email address is already confirmed';
      statusCode = 400;
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