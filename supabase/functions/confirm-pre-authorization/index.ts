import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmPreAuthRequest {
  bookingId: string;
  paymentMethodId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Confirming pre-authorization...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId, paymentMethodId }: ConfirmPreAuthRequest = await req.json();
    
    console.log("Confirm pre-auth request:", { bookingId, paymentMethodId });

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseServiceClient
      .from('parking_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Booking not found: ${bookingError?.message}`);
    }

    if (!booking.stripe_payment_intent_id) {
      throw new Error("No payment intent found for this booking");
    }

    // Confirm the PaymentIntent with the payment method
    const paymentIntent = await stripe.paymentIntents.confirm(booking.stripe_payment_intent_id, {
      payment_method: paymentMethodId,
      return_url: `https://shazamparking.ae/payment-success?booking_id=${bookingId}`,
    });

    console.log("PaymentIntent confirmed:", paymentIntent.id, paymentIntent.status);

    // Update booking with confirmed payment status
    const { error: updateError } = await supabaseServiceClient
      .from('parking_bookings')
      .update({
        payment_status: paymentIntent.status === 'requires_capture' ? 'pre_authorized' : 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in confirm-pre-authorization:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);