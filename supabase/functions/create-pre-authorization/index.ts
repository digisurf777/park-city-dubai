import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreAuthorizationRequest {
  bookingId: string;
  amount: number;
  securityDeposit?: number;
  duration: number;
  parkingSpotName: string;
  userEmail: string;
  authorizationHoldDays?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating pre-authorization...");
    
    // Check if Stripe secret key exists
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      bookingId, 
      amount: rawAmount, 
      securityDeposit = 0,
      duration, 
      parkingSpotName, 
      userEmail,
      authorizationHoldDays = 7
    }: PreAuthorizationRequest = await req.json();
    
    // Stripe minimum amount check for AED is 2.00
    const amount = rawAmount < 2 ? 2 : rawAmount;
    if (rawAmount < 2) {
      console.log(`Amount ${rawAmount} AED is below Stripe minimum. Adjusting to 2 AED.`);
    }
    
    console.log("Pre-authorization request:", { 
      bookingId, 
      originalAmount: rawAmount,
      adjustedAmount: amount, 
      securityDeposit, 
      duration, 
      parkingSpotName, 
      userEmail,
      authorizationHoldDays
    });

    // Find or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log("Found existing customer:", customer.id);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
      });
      console.log("Created new customer:", customer.id);
    }

    // Use booking amount only (no security deposit)
    const totalAmount = amount;
    const authorizationExpiresAt = new Date();
    authorizationExpiresAt.setDate(authorizationExpiresAt.getDate() + authorizationHoldDays);

    // Create checkout session for the pre-authorization (Stripe will create a PaymentIntent for this session)
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      locale: 'en',
      payment_intent_data: {
        setup_future_usage: 'off_session',
        capture_method: 'manual',
        metadata: {
          booking_id: bookingId,
          duration: duration.toString(),
          booking_amount: Math.round(amount * 100).toString(),
          authorization_type: 'parking_booking',
          expires_at: authorizationExpiresAt.toISOString(),
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `${parkingSpotName} - ${duration} Month(s) Parking`,
              description: `Secure parking space pre-authorization for ${duration} month(s)`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://shazamparking.ae/payment-success?booking_id=${bookingId}`,
      cancel_url: `https://shazamparking.ae/find-a-parking-space`,
      metadata: {
        booking_id: bookingId,
        payment_type: 'pre_authorization',
        authorization_expires: authorizationExpiresAt.toISOString(),
      },
    });

    // Determine the PaymentIntent ID created by Checkout
    let paymentIntentId: string | null = null;
    if (typeof session.payment_intent === 'string') {
      paymentIntentId = session.payment_intent;
    } else {
      const expanded = await stripe.checkout.sessions.retrieve(session.id, { expand: ['payment_intent'] });
      if (typeof expanded.payment_intent === 'string') {
        paymentIntentId = expanded.payment_intent as string;
      } else {
        paymentIntentId = (expanded as any).payment_intent?.id ?? null;
      }
    }

    if (!paymentIntentId) {
      console.warn('No payment_intent id found for session', session.id);
    }

    // Update booking record with pre-authorization details
    const { error: updateError } = await supabaseServiceClient
      .from('parking_bookings')
      .update({
        stripe_customer_id: customer.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: 'pre_authorized',
        payment_type: 'one_time',
        payment_link_url: session.url,
        payment_amount_cents: Math.round(amount * 100),
        pre_authorization_amount: Math.round(totalAmount * 100),
        security_deposit_amount: 0,
        pre_authorization_expires_at: authorizationExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log("Pre-authorization created successfully:", session.url);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: session.url,
        payment_intent_id: paymentIntentId,
        pre_authorization_amount: totalAmount,
        authorization_expires_at: authorizationExpiresAt.toISOString(),
        security_deposit_amount: 0,
        hold_period_days: authorizationHoldDays,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-pre-authorization:", error);
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