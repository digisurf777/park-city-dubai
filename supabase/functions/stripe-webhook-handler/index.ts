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
    
    // Verify webhook signature
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
        payment_intent_id: event.type.startsWith('payment_intent.') 
          ? (event.data.object as any).id 
          : event.type === 'checkout.session.completed' 
          ? (event.data.object as any).payment_intent 
          : null,
        raw_event: event,
        status: 'processing'
      });

    if (logError) {
      console.error("Error logging webhook event:", logError);
    }

    // Handle specific webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabaseServiceClient);
        break;
        
      case 'payment_intent.amount_capturable_updated':
        await handlePaymentIntentAmountCapturableUpdated(event.data.object as Stripe.PaymentIntent, supabaseServiceClient);
        break;
        
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("Processing checkout.session.completed:", session.id);
  
  const paymentType = session.metadata?.payment_type;
  
  // Handle deposit payments
  if (paymentType === 'deposit') {
    const listingId = session.metadata?.listing_id;
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : (session.payment_intent as any)?.id;
    
    if (listingId && paymentIntentId) {
      console.log(`Processing deposit payment for listing ${listingId}`);
      
      // Update deposit payment record
      const { error: depositError } = await supabase
        .from('deposit_payments')
        .update({
          stripe_payment_intent_id: paymentIntentId,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id);

      if (depositError) {
        console.error("Error updating deposit payment:", depositError);
      }
      
      // Update listing status
      const { error: listingError } = await supabase
        .from('parking_listings')
        .update({
          deposit_payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (listingError) {
        console.error("Error updating listing deposit status:", listingError);
      }
      
      // Get listing and owner details for confirmation email
      const { data: listing } = await supabase
        .from('parking_listings')
        .select('title, owner_id, profiles!inner(full_name, email)')
        .eq('id', listingId)
        .single();
        
      if (listing) {
        // Send confirmation email
        try {
          await supabase.functions.invoke('send-deposit-payment-confirmation', {
            body: {
              ownerName: listing.profiles.full_name,
              ownerEmail: listing.profiles.email,
              listingTitle: listing.title,
              depositAmount: 500,
              transactionId: paymentIntentId,
            }
          });
          console.log("Deposit confirmation email sent");
        } catch (emailError) {
          console.error("Error sending deposit confirmation email:", emailError);
        }
      }
    }
    return;
  }
  
  // Handle booking payments
  const bookingId = session.metadata?.booking_id;
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : (session.payment_intent as any)?.id;

  if (bookingId && paymentIntentId) {
    console.log(`Linking booking ${bookingId} to PaymentIntent ${paymentIntentId}`);
    
    const { error: updateError } = await supabase
      .from('parking_bookings')
      .update({
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error("Error updating booking with PaymentIntent ID:", updateError);
    }
  }
}

async function handlePaymentIntentAmountCapturableUpdated(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Processing payment_intent.amount_capturable_updated:", paymentIntent.id);
  
  if (paymentIntent.status === 'requires_capture' && paymentIntent.amount_capturable > 0) {
    // Find booking by payment intent ID or metadata
    let booking = await findBookingByPaymentIntent(paymentIntent, supabase);
    
    if (booking) {
      const { error: updateError } = await supabase
        .from('parking_bookings')
        .update({
          payment_status: 'pre_authorized',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error("Error updating booking to pre_authorized:", updateError);
      } else {
        console.log(`Booking ${booking.id} status updated to pre_authorized`);
      }
    }
  }
}

async function findBookingByPaymentIntent(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  // Try to find by PaymentIntent ID first
  let { data: booking, error } = await supabase
    .from('parking_bookings')
    .select('*, profiles!inner(full_name, email, phone)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (!booking && paymentIntent.metadata?.booking_id) {
    // Fallback: find by booking_id in metadata
    const { data: fallbackBooking, error: fallbackError } = await supabase
      .from('parking_bookings')
      .select('*, profiles!inner(full_name, email, phone)')
      .eq('id', paymentIntent.metadata.booking_id)
      .single();
      
    if (!fallbackError && fallbackBooking) {
      booking = fallbackBooking;
      // Update the PaymentIntent ID for future lookups
      await supabase
        .from('parking_bookings')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', booking.id);
    }
  }

  return booking;
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log("Processing payment_intent.succeeded:", paymentIntent.id);
  
  // Check if this is a deposit payment
  if (paymentIntent.metadata?.payment_type === 'deposit') {
    console.log("Handling deposit payment success");
    // Deposit payments are handled in checkout.session.completed
    return;
  }
  
  // Find booking by payment intent ID or metadata
  const booking = await findBookingByPaymentIntent(paymentIntent, supabase);

  if (!booking) {
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
  
  const booking = await findBookingByPaymentIntent(paymentIntent, supabase);

  if (!booking) {
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
  
  const booking = await findBookingByPaymentIntent(paymentIntent, supabase);

  if (!booking) {
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
