import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupConfirmationRequest {
  email: string;
  fullName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, confirmationUrl }: SignupConfirmationRequest = await req.json();

    console.log(`Sending signup confirmation email to ${fullName} (${email})`);
    console.log(`Confirmation URL: ${confirmationUrl}`);

    const emailResponse = await resend.emails.send({
      from: "Shazam Parking <noreply@shazamparking.ae>",
      to: [email],
      subject: "Potwierdź swoje konto - Shazam Parking",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potwierdź swoje konto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Witaj w Shazam Parking!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0;">Cześć ${fullName}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Dziękujemy za rejestrację w Shazam Parking. Aby ukończyć proces rejestracji i aktywować swoje konto, 
              kliknij poniższy przycisk:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block; 
                        transition: transform 0.2s;">
                Potwierdź swoje konto
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              Jeśli nie rejestrowałeś się w Shazam Parking, zignoruj tę wiadomość.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Link jest ważny przez 24 godziny. Jeśli nie możesz kliknąć przycisku, skopiuj i wklej poniższy link do przeglądarki:
            </p>
            
            <p style="font-size: 12px; color: #888; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${confirmationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Shazam Parking</strong><br>
                Najłatwiejszy sposób na znalezienie parkingu w Dubaju
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Signup confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending signup confirmation email:", error);
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