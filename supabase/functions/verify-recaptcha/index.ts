import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRecaptchaRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyRecaptchaRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "reCAPTCHA token is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ error: "reCAPTCHA verification not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Verifying reCAPTCHA token...");

    // Verify the token with Google's reCAPTCHA API
    const verificationResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verificationResult = await verificationResponse.json();
    
    console.log("reCAPTCHA verification result:", verificationResult);

    if (verificationResult.success) {
      // For reCAPTCHA v3, check the score (0.0 to 1.0, higher is better)
      const score = verificationResult.score || 0;
      const minScore = 0.5; // Adjust this threshold as needed
      
      if (score < minScore) {
        console.log("reCAPTCHA score too low:", score);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "reCAPTCHA score too low",
            score: score
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          score: score,
          message: "reCAPTCHA verification successful"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      console.log("reCAPTCHA verification failed:", verificationResult["error-codes"]);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "reCAPTCHA verification failed",
          errorCodes: verificationResult["error-codes"] || []
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in verify-recaptcha function:", error);
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