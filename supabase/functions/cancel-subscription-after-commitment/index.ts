import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking subscriptions for commitment completion...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all bookings with active subscriptions that have reached their commitment period
    const { data: bookings, error: bookingsError } = await supabaseServiceClient
      .from('parking_bookings')
      .select('*')
      .eq('payment_type', 'recurring')
      .eq('payment_status', 'paid')
      .not('stripe_subscription_id', 'is', null);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    console.log(`Found ${bookings?.length || 0} bookings with subscriptions`);

    for (const booking of bookings || []) {
      try {
        // Calculate if the commitment period is complete
        const startDate = new Date(booking.start_time);
        const commitmentEndDate = new Date(startDate);
        commitmentEndDate.setMonth(commitmentEndDate.getMonth() + booking.duration_hours); // duration_hours stores months for monthly bookings
        
        const now = new Date();
        
        // If commitment period is complete, cancel the subscription
        if (now >= commitmentEndDate) {
          console.log(`Canceling subscription for booking ${booking.id} - commitment period complete`);
          
          const subscription = await stripe.subscriptions.retrieve(booking.stripe_subscription_id);
          
          if (subscription.status === 'active') {
            await stripe.subscriptions.cancel(booking.stripe_subscription_id);
            
            // Update booking status
            await supabaseServiceClient
              .from('parking_bookings')
              .update({
                status: 'completed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', booking.id);
              
            console.log(`Successfully canceled subscription for booking ${booking.id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        // Continue with next booking
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription check completed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in cancel-subscription-after-commitment:", error);
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