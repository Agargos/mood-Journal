import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    
    if (!signature) {
      console.error("No signature found in webhook");
      return new Response("No signature", { status: 400 });
    }

    // Verify webhook signature (you should set a webhook secret in Paystack dashboard)
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const hash = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature_buffer = await crypto.subtle.sign("HMAC", hash, new TextEncoder().encode(body));
    const expected_signature = Array.from(new Uint8Array(signature_buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expected_signature) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Webhook event received:", event);

    // Handle successful payment
    if (event.event === "charge.success") {
      const { data } = event;
      const userId = data.metadata?.user_id;

      if (userId) {
        // Create Supabase client with service role
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );

        // Update user's premium status
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ premium: true })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating user premium status:", updateError);
          return new Response("Database update failed", { status: 500 });
        }

        console.log(`Premium activated for user: ${userId}`);
      }
    }

    return new Response("Webhook processed", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});