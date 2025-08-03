import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  bookingId: string;
  amount: number; // First month payment
  monthlyRate: number; // Monthly subscription rate
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

    const { bookingId, amount, monthlyRate, duration, parkingSpotName, userEmail }: PaymentLinkRequest = await req.json();
    
    console.log("Payment request details:", { bookingId, amount, monthlyRate, duration, parkingSpotName, userEmail });

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

    // Create one-time payment for all durations (upfront payment for full period)
    paymentType = 'one_time';
    const totalAmount = monthlyRate * duration; // Full amount for the entire period
    
    console.log(`Creating one-time payment for ${duration} months, total: AED ${totalAmount}`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to fils (full period amount)
      currency: 'aed',
      customer: customer.id,
      capture_method: 'manual', // Pre-authorize but don't capture
      description: `Parking booking for ${parkingSpotName} - ${duration} ${duration === 1 ? 'month' : 'months'}`,
      metadata: {
        booking_id: bookingId,
        duration: duration.toString(),
        monthly_rate: monthlyRate.toString(),
      },
    });

    paymentIntentId = paymentIntent.id;
    
    // Create checkout session for the payment intent
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      locale: 'en',
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `${parkingSpotName} - ${duration} ${duration === 1 ? 'Month' : 'Months'} Parking`,
              description: `Secure parking space for ${duration} ${duration === 1 ? 'month' : 'months'}${duration > 1 ? ` (${duration} × AED ${monthlyRate}/month)` : ''}`,
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
        payment_type: 'one_time',
        duration: duration.toString(),
      },
    });

    paymentUrl = session.url || "";

    // Update booking record with payment details
    const { error: updateError } = await supabaseServiceClient
      .from('parking_bookings')
      .update({
        stripe_customer_id: customer.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_subscription_id: subscriptionId,
        payment_status: 'pending',
        payment_type: paymentType,
        payment_link_url: paymentUrl,
        payment_amount_cents: Math.round(totalAmount * 100), // Full period payment
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