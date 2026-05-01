// Generate an AI avatar using Lovable AI Gateway and upload to the user's avatars bucket
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STYLE_PROMPTS = [
  "Minimalist abstract avatar of a stylized luxury car silhouette in a soft rounded badge, deep teal and emerald green gradient with cream highlights, modern flat 3D design, premium feel, centered composition, no text",
  "Minimalist abstract avatar with a geometric Dubai skyline silhouette and Burj Khalifa, twilight teal sky gradient with warm amber sun, flat modern design with subtle depth, centered, no text, no people",
  "Minimalist abstract avatar, soft circular pattern with overlapping teal and emerald rings, subtle gold sparkle accents, modern flat design with soft 3D shading, premium centered composition, no text",
  "Minimalist abstract avatar of a stylized parking P symbol with a tiny car silhouette inside, deep teal and mint gradient with cream highlights, modern flat 3D design, centered, no text",
  "Minimalist abstract avatar with stylized palm tree on soft sand dunes at sunset, teal sky gradient with warm coral horizon, modern flat 3D design, centered composition, no text",
  "Minimalist abstract avatar showing a stylized geometric person silhouette built from soft rounded shapes, teal-emerald gradient background with warm gold accent, modern friendly flat 3D design, centered, no facial features, no text",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const customPrompt: string | undefined = body?.prompt;
    const stylePrompt =
      customPrompt && customPrompt.trim().length > 0
        ? `Minimalist abstract premium avatar, ${customPrompt.trim()}, teal and emerald green palette with cream/gold accents, modern flat 3D design, centered, no text, no logos`
        : STYLE_PROMPTS[Math.floor(Math.random() * STYLE_PROMPTS.length)];

    // Call Lovable AI Gateway for image generation
    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: stylePrompt }],
          modalities: ["image", "text"],
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please top up Lovable AI workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const dataUrl: string | undefined =
      aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      console.error("No image in response", JSON.stringify(aiJson).slice(0, 400));
      throw new Error("No image returned by AI");
    }

    // data:image/png;base64,xxxx
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mime = match[1];
    const base64 = match[2];
    const ext = mime.split("/")[1].split("+")[0];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const path = `${user.id}/ai-avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await adminClient.storage
      .from("avatars")
      .upload(path, bytes, {
        contentType: mime,
        upsert: true,
        cacheControl: "3600",
      });
    if (upErr) throw upErr;

    const { data: pub } = adminClient.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: dbErr } = await adminClient
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);
    if (dbErr) throw dbErr;

    return new Response(JSON.stringify({ avatar_url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-avatar error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
