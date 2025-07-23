import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundPaymentRequest {
  bookingId: string;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing payment refund...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId, reason = "Booking rejected" }: RefundPaymentRequest = await req.json();
    console.log("Refunding payment for booking:", bookingId);

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
      // Cancel the pre-authorized payment intent
      console.log("Canceling payment intent:", booking.stripe_payment_intent_id);
      
      await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
      
      // Update booking status
      await supabaseServiceClient
        .from('parking_bookings')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      console.log("One-time payment cancelled successfully");
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Pre-authorization cancelled successfully",
          payment_status: 'refunded',
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
      
    } else if (booking.payment_type === 'recurring' && booking.stripe_subscription_id) {
      // Cancel the subscription
      console.log("Canceling subscription:", booking.stripe_subscription_id);
      
      await stripe.subscriptions.cancel(booking.stripe_subscription_id);
      
      // Update booking status
      await supabaseServiceClient
        .from('parking_bookings')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      console.log("Subscription cancelled successfully");
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Subscription cancelled successfully",
          payment_status: 'refunded',
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("No payment to refund");

  } catch (error) {
    console.error("Error in refund-payment:", error);
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