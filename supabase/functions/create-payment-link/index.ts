import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  bookingId: string;
  amount: number;
  duration: number;
  parkingSpotName: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating payment link...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId, amount: rawAmount, duration, parkingSpotName, userEmail }: PaymentLinkRequest = await req.json();
    
    // Stripe minimum amount check for AED is 2.00
    const amount = rawAmount < 2 ? 2 : rawAmount;
    if (rawAmount < 2) {
      console.log(`Amount ${rawAmount} AED is below Stripe minimum. Adjusting to 2 AED.`);
    }
    
    console.log("Payment request details:", { 
      bookingId, 
      originalAmount: rawAmount,
      adjustedAmount: amount, 
      duration, 
      parkingSpotName, 
      userEmail 
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

    let paymentIntentId = null;
    let subscriptionId = null;
    let paymentType: 'one_time' | 'recurring';
    let paymentUrl = "";

    // Set confirmation deadline (2 days from now)
    const confirmationDeadline = new Date();
    confirmationDeadline.setDate(confirmationDeadline.getDate() + 2);

    if (duration === 1) {
      // One-time payment with manual capture (pre-authorization)
      paymentType = 'one_time';
      
      // Create checkout session with manual capture
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        locale: 'en',
        payment_intent_data: {
          setup_future_usage: 'off_session',
          capture_method: 'manual', // Pre-authorize but don't capture
          description: `Parking booking for ${parkingSpotName} - ${duration} month`,
          metadata: {
            booking_id: bookingId,
            duration: duration.toString(),
          },
        },
        line_items: [
          {
            price_data: {
              currency: 'aed',
              product_data: {
                name: `${parkingSpotName} - ${duration} Month Parking`,
                description: `Secure parking space for ${duration} month`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://shazamparking.ae/payment-success?booking_id=${bookingId}`,
        cancel_url: `https://shazamparking.ae/find-a-parking-space`,
        metadata: {
          booking_id: bookingId,
          payment_type: 'one_time',
        },
      });

      // Get the PaymentIntent ID from the session
      if (typeof session.payment_intent === 'string') {
        paymentIntentId = session.payment_intent;
      } else {
        // Expand session to get PaymentIntent ID
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['payment_intent']
        });
        paymentIntentId = (expandedSession.payment_intent as any)?.id || null;
      }

      paymentUrl = session.url || "";
      console.log(`Created checkout session with PaymentIntent: ${paymentIntentId}`);
      
    } else {
      // Recurring monthly payments with trial period
      paymentType = 'recurring';
      
      // Create a product and price for the recurring payment
      const product = await stripe.products.create({
        name: `${parkingSpotName} - Monthly Parking`,
        description: `Monthly parking subscription for ${parkingSpotName}`,
      });

      const price = await stripe.prices.create({
        currency: 'aed',
        unit_amount: Math.round(amount * 100), // Monthly amount in cents
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        locale: 'en',
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          metadata: {
            booking_id: bookingId,
            duration: duration.toString(),
          },
        },
        success_url: `https://shazamparking.ae/payment-success?booking_id=${bookingId}`,
        cancel_url: `https://shazamparking.ae/find-a-parking-space`,
        metadata: {
          booking_id: bookingId,
          payment_type: 'recurring',
        },
      });

      paymentUrl = session.url || "";
    }

    // Set pre-authorization expiry for manual capture payments
    const preAuthExpiry = new Date();
    preAuthExpiry.setDate(preAuthExpiry.getDate() + 7); // 7-day pre-auth hold

    // Update booking record with payment details
    const { error: updateError } = await supabaseServiceClient
      .from('parking_bookings')
      .update({
        stripe_customer_id: customer.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_subscription_id: subscriptionId,
        payment_status: 'pending', // Let webhooks update to 'pre_authorized' or 'paid'
        payment_type: paymentType,
        payment_link_url: paymentUrl,
        payment_amount_cents: Math.round(amount * 100),
        pre_authorization_amount: paymentType === 'one_time' ? Math.round(amount * 100) : null,
        pre_authorization_expires_at: paymentType === 'one_time' ? preAuthExpiry.toISOString() : null,
        confirmation_deadline: confirmationDeadline.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log("Payment link created successfully:", paymentUrl);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        payment_type: paymentType,
        confirmation_deadline: confirmationDeadline.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-payment-link:", error);
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