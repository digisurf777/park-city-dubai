import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepositPaymentRequest {
  listingId: string;
  ownerEmail: string;
  ownerName: string;
  listingTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating deposit payment link...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { listingId, ownerEmail, ownerName, listingTitle }: DepositPaymentRequest = await req.json();
    
    const DEPOSIT_AMOUNT_AED = 500;
    
    console.log("Deposit payment request:", { 
      listingId, 
      ownerEmail,
      ownerName,
      listingTitle,
      amount: DEPOSIT_AMOUNT_AED
    });

    // Find or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: ownerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log("Found existing customer:", customer.id);
    } else {
      customer = await stripe.customers.create({
        email: ownerEmail,
        name: ownerName,
      });
      console.log("Created new customer:", customer.id);
    }

    // Create checkout session for one-time deposit payment
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      locale: 'en',
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Access Device Deposit - ${listingTitle}`,
              description: 'Refundable deposit for parking access device',
            },
            unit_amount: DEPOSIT_AMOUNT_AED * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://shazamparking.ae/payment-success?type=deposit&listing_id=${listingId}`,
      cancel_url: `https://shazamparking.ae/my-account`,
      metadata: {
        listing_id: listingId,
        payment_type: 'deposit',
      },
    });

    const paymentUrl = session.url || "";

    // Create deposit payment record
    const { data: depositPayment, error: insertError } = await supabaseServiceClient
      .from('deposit_payments')
      .insert({
        listing_id: listingId,
        owner_id: (await supabaseServiceClient
          .from('parking_listings')
          .select('owner_id')
          .eq('id', listingId)
          .single()).data?.owner_id,
        amount_aed: DEPOSIT_AMOUNT_AED,
        stripe_session_id: session.id,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating deposit payment record:", insertError);
      throw new Error(`Failed to create deposit payment: ${insertError.message}`);
    }

    // Update listing with deposit payment details
    const { error: updateError } = await supabaseServiceClient
      .from('parking_listings')
      .update({
        deposit_payment_link: paymentUrl,
        deposit_stripe_session_id: session.id,
        deposit_payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateError) {
      console.error("Error updating listing:", updateError);
      throw new Error(`Failed to update listing: ${updateError.message}`);
    }

    console.log("Deposit payment link created successfully:", paymentUrl);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        amount_aed: DEPOSIT_AMOUNT_AED,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in create-deposit-payment-link:", error);
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
