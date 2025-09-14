import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CaptureRequest {
  bookingId: string;
  captureAmount?: number; // Optional for partial captures
  captureSecurityDeposit?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Capturing pre-authorization...");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { bookingId, captureAmount, captureSecurityDeposit = false }: CaptureRequest = await req.json();
    console.log("Capture request:", { bookingId, captureAmount, captureSecurityDeposit });

    // Get booking details
    const { data: booking, error: fetchError } = await supabaseServiceClient
      .from('parking_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error("Booking not found");
    }

    if (!booking.stripe_payment_intent_id) {
      throw new Error("No payment intent found for this booking");
    }

    // Check if authorization has expired
    if (booking.pre_authorization_expires_at && new Date() > new Date(booking.pre_authorization_expires_at)) {
      throw new Error("Pre-authorization has expired and cannot be captured");
    }

    // Calculate capture amount
    let amountToCapture: number;
    
    if (captureAmount) {
      // Partial capture - use specified amount
      amountToCapture = Math.round(captureAmount * 100);
    } else {
      // Full capture - use booking amount
      amountToCapture = booking.payment_amount_cents;
      
      // Include security deposit if requested
      if (captureSecurityDeposit && booking.security_deposit_amount) {
        amountToCapture += booking.security_deposit_amount;
      }
    }

    console.log("Capturing payment intent:", {
      paymentIntentId: booking.stripe_payment_intent_id,
      amountToCapture: amountToCapture
    });

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripe_payment_intent_id,
      {
        amount_to_capture: amountToCapture,
      }
    );

    if (paymentIntent.status === 'succeeded') {
      // Determine new payment status
      const totalPreAuthAmount = booking.pre_authorization_amount || booking.payment_amount_cents;
      const newPaymentStatus = amountToCapture < totalPreAuthAmount ? 'partially_captured' : 'confirmed';

      // Update booking status
      const { error: updateError } = await supabaseServiceClient
        .from('parking_bookings')
        .update({
          status: 'confirmed',
          payment_status: newPaymentStatus,
          capture_amount: amountToCapture,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) {
        console.error("Error updating booking after capture:", updateError);
        throw new Error(`Failed to update booking: ${updateError.message}`);
      }

      console.log("Pre-authorization captured successfully");

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment captured successfully",
          payment_status: newPaymentStatus,
          captured_amount: amountToCapture / 100,
          remaining_authorized: (totalPreAuthAmount - amountToCapture) / 100,
          payment_intent_status: paymentIntent.status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(`Payment capture failed with status: ${paymentIntent.status}`);
    }

  } catch (error) {
    console.error("Error in capture-pre-authorization:", error);
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