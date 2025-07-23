import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmPaymentRequest {
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Confirming payment...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId }: ConfirmPaymentRequest = await req.json();
    console.log("Confirming payment for booking:", bookingId);

    // Get booking details
    const { data: booking, error: fetchError } = await supabaseServiceClient
      .from('parking_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error("Booking not found");
    }

    console.log("Booking details:", {
      id: booking.id,
      payment_type: booking.payment_type,
      payment_status: booking.payment_status,
      stripe_payment_intent_id: booking.stripe_payment_intent_id,
      stripe_subscription_id: booking.stripe_subscription_id,
    });

    if (booking.payment_type === 'one_time' && booking.stripe_payment_intent_id) {
      // Capture the pre-authorized payment
      console.log("Capturing payment intent:", booking.stripe_payment_intent_id);
      
      const paymentIntent = await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
      
      if (paymentIntent.status === 'succeeded') {
        // Update booking status to confirmed
        await supabaseServiceClient
          .from('parking_bookings')
          .update({
            status: 'confirmed',
            payment_status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        console.log("One-time payment confirmed successfully");
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment captured successfully",
            payment_status: 'confirmed',
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    } else if (booking.payment_type === 'recurring' && booking.stripe_subscription_id) {
      // For recurring payments, remove trial period to start billing
      console.log("Activating subscription:", booking.stripe_subscription_id);
      
      const subscription = await stripe.subscriptions.update(booking.stripe_subscription_id, {
        trial_end: 'now', // End trial period and start billing immediately
      });

      if (subscription.status === 'active') {
        // Update booking status to confirmed
        await supabaseServiceClient
          .from('parking_bookings')
          .update({
            status: 'confirmed',
            payment_status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        console.log("Recurring payment confirmed successfully");
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription activated successfully",
            payment_status: 'confirmed',
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    throw new Error("Unable to confirm payment");

  } catch (error) {
    console.error("Error in confirm-payment:", error);
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