import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectBookingRequest {
  bookingId: string;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Rejecting booking...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId, reason }: RejectBookingRequest = await req.json();
    console.log("Rejecting booking:", bookingId);

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

    // Cancel/refund based on payment type
    if (booking.payment_type === 'one_time' && booking.stripe_payment_intent_id) {
      // Cancel the pre-authorized payment intent
      console.log("Cancelling payment intent:", booking.stripe_payment_intent_id);
      
      try {
        await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
        console.log("Payment intent cancelled successfully");
      } catch (stripeError) {
        console.error("Error cancelling payment intent:", stripeError);
        // Continue with booking cancellation even if Stripe fails
      }
    } else if (booking.payment_type === 'recurring' && booking.stripe_subscription_id) {
      // Cancel the subscription
      console.log("Cancelling subscription:", booking.stripe_subscription_id);
      
      try {
        await stripe.subscriptions.cancel(booking.stripe_subscription_id);
        console.log("Subscription cancelled successfully");
      } catch (stripeError) {
        console.error("Error cancelling subscription:", stripeError);
        // Continue with booking cancellation even if Stripe fails
      }
    }

    // Update booking status to cancelled
    await supabaseServiceClient
      .from('parking_bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
        cancellation_reason: reason || 'Space no longer available',
      })
      .eq('id', bookingId);

    // Get customer details for rejection email
    const { data: profile } = await supabaseServiceClient
      .from('profiles')
      .select('full_name, user_id')
      .eq('user_id', booking.user_id)
      .single();

    const { data: user } = await supabaseServiceClient.auth.admin.getUserById(booking.user_id);

    // Send booking rejection email
    if (user && user.user && profile) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-rejection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            customerEmail: user.user.email,
            customerName: profile.full_name || 'Customer',
            reason: reason || 'Space no longer available',
          }),
        });
        console.log("Booking rejection email sent");
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    console.log("Booking rejected successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking rejected and payment refunded",
        payment_status: 'refunded',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in reject-booking:", error);
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