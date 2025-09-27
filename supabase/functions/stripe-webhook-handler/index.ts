import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseServiceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("Stripe webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get webhook signature for verification
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature (you'll need to set STRIPE_WEBHOOK_SECRET in Supabase)
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Webhook signature verified:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Log the webhook event for audit
    const { error: logError } = await supabaseServiceClient
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payment_intent_id: event.type.startsWith('payment_intent.') ? (event.data.object as any).id : null,
        raw_event: event,
        status: 'processing'
      });

    if (logError) {
      console.error("Error logging webhook event:", logError);
    }

    // Handle specific webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseServiceClient);
        break;
        
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, supabaseServiceClient);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabaseServiceClient);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Update webhook event status to processed
    await supabaseServiceClient
      .from('stripe_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    
    // Try to log error if we have event context
    try {
      const body = await req.text();
      const event = JSON.parse(body);
      if (event.id) {
        await supabaseServiceClient
          .from('stripe_webhook_events')
          .update({ 
            status: 'error', 
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processed_at: new Date().toISOString() 
          })
          .eq('stripe_event_id', event.id);
      }
    } catch (logErr) {
      console.error("Could not log webhook error:", logErr);
    }

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

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Processing payment_intent.succeeded:", paymentIntent.id);
  
  // Find booking by payment intent ID
  const { data: booking, error: bookingError } = await supabase
    .from('parking_bookings')
    .select('*, profiles!inner(full_name, email, phone)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (bookingError || !booking) {
    console.error("Booking not found for payment intent:", paymentIntent.id);
    return;
  }

  // Update booking status based on payment intent status
  let newStatus = 'pending';
  let newPaymentStatus = 'pre_authorized';

  console.log(`PaymentIntent status: ${paymentIntent.status}`);

  if (paymentIntent.status === 'succeeded') {
    // Payment was captured (fully charged)
    newStatus = 'confirmed';
    newPaymentStatus = 'paid';
    console.log('Payment succeeded - setting status to confirmed and payment_status to paid');
  } else if (paymentIntent.status === 'requires_capture') {
    // Payment is pre-authorized but not captured yet
    newStatus = 'pending';
    newPaymentStatus = 'pre_authorized';
    console.log('Payment requires capture - keeping status as pending');
  } else if (paymentIntent.status === 'processing') {
    // Payment is being processed
    newStatus = 'pending';
    newPaymentStatus = 'processing';
    console.log('Payment is processing - keeping status as pending');
  } else {
    console.log(`Unhandled payment intent status: ${paymentIntent.status}`);
  }

  const { error: updateError } = await supabase
    .from('parking_bookings')
    .update({
      status: newStatus,
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (updateError) {
    console.error("Error updating booking status:", updateError);
    throw updateError;
  }

  console.log(`Booking ${booking.id} updated: status=${newStatus}, payment_status=${newPaymentStatus}`);

  // Send admin notification for successful payment
  if (paymentIntent.status === 'succeeded' && booking.profiles) {
    try {
      // Create admin notification in database
      await supabase
        .from('admin_notifications')
        .insert({
          notification_type: 'payment_received',
          title: '💳 Payment Received',
          message: `Payment of ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} received for booking #${booking.id.slice(0, 8)} by ${booking.profiles.full_name}`,
          booking_id: booking.id,
          user_id: booking.user_id,
          priority: 'high'
        });

      // Send email notification to admin
      await supabase.functions.invoke('send-admin-booking-notification', {
        body: {
          userName: booking.profiles.full_name,
          userEmail: booking.profiles.email,
          userPhone: booking.profiles.phone,
          bookingId: booking.id,
          parkingSpotName: booking.location,
          zone: booking.zone,
          location: booking.location,
          startDate: booking.start_time,
          duration: booking.duration_hours / 24 / 30 || 1,
          totalCost: booking.cost_aed,
          paymentType: booking.payment_type,
          notes: `Payment completed via Stripe. Payment Intent: ${paymentIntent.id}`
        }
      });

      console.log(`Admin notification sent for payment: ${paymentIntent.id}`);
    } catch (notificationError) {
      console.error("Error sending admin payment notification:", notificationError);
    }
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Processing payment_intent.canceled:", paymentIntent.id);
  
  const { data: booking, error: bookingError } = await supabase
    .from('parking_bookings')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (bookingError || !booking) {
    console.error("Booking not found for payment intent:", paymentIntent.id);
    return;
  }

  const { error: updateError } = await supabase
    .from('parking_bookings')
    .update({
      status: 'cancelled',
      payment_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (updateError) {
    console.error("Error updating booking status for canceled payment:", updateError);
    throw updateError;
  }

  console.log(`Booking ${booking.id} canceled due to payment cancellation`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Processing payment_intent.payment_failed:", paymentIntent.id);
  
  const { data: booking, error: bookingError } = await supabase
    .from('parking_bookings')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (bookingError || !booking) {
    console.error("Booking not found for payment intent:", paymentIntent.id);
    return;
  }

  const { error: updateError } = await supabase
    .from('parking_bookings')
    .update({
      status: 'rejected',
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (updateError) {
    console.error("Error updating booking status for failed payment:", updateError);
    throw updateError;
  }

  console.log(`Booking ${booking.id} marked as failed due to payment failure`);
}

serve(handler);