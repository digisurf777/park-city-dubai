import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface IncomingMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface Body {
  message?: string;                 // single new user message (widget mode)
  history?: IncomingMsg[];          // optional already-loaded history (widget)
  mode?: 'reply' | 'draft';         // 'draft' = admin draft generator
  targetUserId?: string;            // admin draft only — generate context for this user
  sessionId?: string;               // groups messages into one chat session (new chat = new id)
}

const SUPPORT_EMAIL = 'support@shazamparking.ae';
const HANDOFF_TOKEN = '[[HANDOFF]]';

async function notifyHumanHandoff(opts: {
  resendKey: string | undefined;
  userName: string;
  userEmail: string;
  userPhone: string;
  question: string;
  sessionId?: string;
}) {
  if (!opts.resendKey) {
    console.warn('RESEND_API_KEY not set — skipping handoff email');
    return;
  }
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#0f172a">🆘 Online Support escalated a chat to a human</h2>
        <p style="color:#334155">A user asked something the AI assistant could not answer with confidence.</p>
        <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:4px 0"><b>User:</b> ${opts.userName}</p>
          <p style="margin:4px 0"><b>Email:</b> ${opts.userEmail}</p>
          <p style="margin:4px 0"><b>Phone:</b> ${opts.userPhone}</p>
          ${opts.sessionId ? `<p style="margin:4px 0"><b>Session:</b> ${opts.sessionId}</p>` : ''}
        </div>
        <p style="color:#334155"><b>Last message:</b></p>
        <blockquote style="border-left:3px solid #6366f1;padding-left:12px;color:#475569">${opts.question.replace(/</g,'&lt;')}</blockquote>
        <p style="color:#64748b;font-size:12px;margin-top:24px">Reply directly in the admin chat panel.</p>
      </div>`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${opts.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Shazam Parking <noreply@shazamparking.ae>',
        to: [SUPPORT_EMAIL],
        bcc: [SUPPORT_EMAIL],
        subject: `🆘 Human handoff requested — ${opts.userName}`,
        html,
      }),
    });
  } catch (err) {
    console.error('Handoff email failed', err);
  }
}

function fmt(d: string | Date | null | undefined) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
}

async function loadUserContext(admin: ReturnType<typeof createClient>, userId: string) {
  const [profileR, bookingsR, listingsR, payoutsR, verifR, notifR] = await Promise.all([
    admin.from('profiles').select('full_name, email, phone, user_type, created_at').eq('user_id', userId).maybeSingle(),
    admin.from('parking_bookings')
      .select('id, location, zone, start_time, end_time, status, payment_status, cost_aed, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(8),
    admin.from('parking_listings')
      .select('id, title, address, zone, status, price_per_month, created_at')
      .eq('owner_id', userId).order('created_at', { ascending: false }).limit(8),
    admin.from('owner_payments')
      .select('id, amount_aed, payment_date, status, payment_period_start, payment_period_end')
      .eq('owner_id', userId).order('payment_date', { ascending: false }).limit(5),
    admin.from('user_verifications').select('verification_status, document_type, created_at').eq('user_id', userId).maybeSingle(),
    admin.from('user_notifications').select('title, message, created_at, is_read').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    profile: profileR.data,
    bookings: bookingsR.data ?? [],
    listings: listingsR.data ?? [],
    payouts: payoutsR.data ?? [],
    verification: verifR.data,
    notifications: notifR.data ?? [],
  };
}

async function loadKnowledge(admin: ReturnType<typeof createClient>, query: string) {
  // Pull all active entries (small table). Rank client-side by keyword overlap.
  const { data } = await admin
    .from('platform_knowledge')
    .select('category, title, content, keywords, priority')
    .eq('is_active', true);

  if (!data) return [];

  const q = (query || '').toLowerCase();
  const scored = data.map((row: any) => {
    let score = row.priority ?? 0;
    for (const kw of (row.keywords ?? []) as string[]) {
      if (q.includes(kw.toLowerCase())) score += 25;
    }
    if (q && row.title && q.includes(row.title.toLowerCase())) score += 15;
    return { row, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((s) => s.row);
}

function buildSystemPrompt(ctx: any, knowledge: any[], adminMode: boolean) {
  const profile = ctx.profile;
  const userBlock = profile
    ? `Name: ${profile.full_name || '—'}\nEmail: ${profile.email || '—'}\nPhone: ${profile.phone || '—'}\nAccount type: ${profile.user_type || 'seeker'}\nMember since: ${fmt(profile.created_at)}`
    : 'No profile on file.';

  const bookingBlock = ctx.bookings.length
    ? ctx.bookings.map((b: any) => `• ${b.location} (${b.zone}) — ${fmt(b.start_time)} → ${fmt(b.end_time)} — status: ${b.status}, payment: ${b.payment_status}, ${b.cost_aed} AED`).join('\n')
    : 'No bookings yet.';

  const listingBlock = ctx.listings.length
    ? ctx.listings.map((l: any) => `• ${l.title} (${l.zone}) — ${l.address} — status: ${l.status}, monthly: ${l.price_per_month ?? '—'} AED`).join('\n')
    : 'No listings.';

  const payoutBlock = ctx.payouts.length
    ? ctx.payouts.map((p: any) => `• ${fmt(p.payment_date)}: ${p.amount_aed} AED — ${p.status} (${fmt(p.payment_period_start)}–${fmt(p.payment_period_end)})`).join('\n')
    : 'No payouts yet.';

  const verifBlock = ctx.verification
    ? `Verification: ${ctx.verification.verification_status} (${ctx.verification.document_type || '—'})`
    : 'Verification: not started.';

  const knowledgeBlock = knowledge
    .map((k: any) => `## ${k.title} [${k.category}]\n${k.content}`)
    .join('\n\n');

  const persona = adminMode
    ? `You are drafting a reply on behalf of the Shazam Parking admin team.
The admin will edit and send your draft, so write in first-person plural ("we", "our team"), warm and professional, and address the user by first name when you have it.
Be concrete: reference specific bookings/listings/payouts when relevant. Keep it short — 2 to 5 sentences unless more detail is genuinely needed.
Never invent facts. If you don't know, say "I'll check with the team and get back to you" instead of guessing.`
    : `You are the Online Support assistant for Shazam Parking, Dubai's trusted monthly parking marketplace (shazamparking.ae). The user sees you simply as "Online Support". You are a true product expert: you know exactly how every part of the platform works and you can explain it clearly to drivers, owners, and visitors.

WHAT SHAZAM PARKING IS (always-on knowledge):
- A marketplace that connects drivers who need a monthly parking space in Dubai with owners who rent out their unused private bays.
- All bookings are MONTHLY (we never quote or display per-hour pricing). Durations are shown as rounded months.
- Coverage zones include Dubai Marina, Downtown, Palm Jumeirah, Business Bay, DIFC, and Deira, plus other Dubai neighborhoods.
- Part of the Shazam ecosystem alongside sister products Dubai Life OS and Dubai Life Maps.

HOW IT WORKS (be ready to explain any of these flows):
- Drivers: browse zones or search, open a parking space, pick start date and duration, submit a booking request, then complete payment via the secure Stripe link we send. Pre-authorization is used until the owner confirms, then the card is captured. Confirmation emails go to both sides. All bookings are FINAL and NON-REFUNDABLE once paid.
- Owners: create a listing with photos, location, description, and monthly price; submit verification documents (Emirates ID / title deed / tenancy contract / parking permit); once approved, listings go live and bookings can come in. Owners receive monthly payouts after providing banking details in My Account.
- Access cards: when a space requires a physical card, a 500 AED refundable deposit plus a 100 AED handling fee applies. Returned in good condition = deposit refunded.
- My Account: bookings, listings, payouts, banking details, document uploads, MFA setup, profile (phone is mandatory, minimum 5 characters).
- Chat & Support: built-in driver/owner chat is enabled exactly when there is an active matching booking. Online Support (you) is available anytime for general help.
- Security: Multi-Factor Authentication is available and required for admins; sessions auto-expire on inactivity.

TONE AND STYLE (very important):
- Professional, clear, warm, and confident. Sound like a human teammate who genuinely knows the product, not a corporate bot.
- NEVER use em dashes (—) or en dashes (–). Use commas, periods, parentheses, or a colon instead. This rule has zero exceptions.
- Use occasional, tasteful emojis to aid understanding (for example 🅿️ for parking, 📅 for dates, ✅ for confirmation, 💳 for payment, 📍 for location, 🔒 for security). One or two per reply at most, and only when they genuinely help. Never decorate every line.
- Contractions are fine ("you're", "we'll"). Avoid robotic phrases like "I am an AI" or "Certainly!".
- Greet with the user's first name once at the start when you have it (e.g. "Hi Marcin,"). Never introduce yourself with a personal name.
- Acknowledge the question in one short line, then answer.

LENGTH AND FORMAT:
- Keep replies SHORT: 1 to 3 short paragraphs.
- Use bullet points only for genuine step-by-step instructions or short lists. Otherwise write flowing prose.
- Light markdown only (occasional **bold**, no headings inside replies).
- When explaining a flow (booking, listing, payout, refund policy, access cards, verification), be concrete and walk through the steps in order.

CONTEXT USAGE:
- Always check the USER PROFILE, BOOKINGS, LISTINGS, PAYOUTS, and PLATFORM KNOWLEDGE blocks below BEFORE answering.
- Reference specific items when relevant ("your booking at Marina Heights starting 12 Mar...").
- Never invent facts, prices, dates, or policies. If you genuinely don't know, say so honestly and offer to escalate.

ESCALATION TO A HUMAN — VERY IMPORTANT:
If you are not fully confident, OR the user asks for refunds, complaints, account changes, legal matters, payout disputes, anything sensitive, OR explicitly asks for a human / agent / person, you MUST end your reply with this exact token on its own line:
${HANDOFF_TOKEN}
When you escalate, your visible reply should be a short, warm message like: "Let me get a teammate to jump in, they'll email you shortly at the address on your account." Then the token. Don't invent answers when escalating.

HARD RULES:
- Never display or mention pricing-per-hour. All bookings are final and non-refundable once paid.
- Phone numbers are mandatory.
- No em dashes or en dashes anywhere in your output.`;

  return `${persona}

================ USER PROFILE ================
${userBlock}

================ BOOKINGS (newest first) ================
${bookingBlock}

================ LISTINGS ================
${listingBlock}

================ RECENT PAYOUTS ================
${payoutBlock}

${verifBlock}

================ PLATFORM KNOWLEDGE (use these facts) ================
${knowledgeBlock || '(none matched)'}

================ END CONTEXT ================`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI gateway not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerId = userData.user.id;

    const body = (await req.json()) as Body;
    const mode = body.mode === 'draft' ? 'draft' : 'reply';
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let contextUserId = callerId;
    if (mode === 'draft') {
      // Verify caller is admin
      const { data: roleRow } = await adminClient.from('user_roles').select('role').eq('user_id', callerId).eq('role', 'admin').maybeSingle();
      if (!roleRow) {
        return new Response(JSON.stringify({ error: 'Admin only' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (!body.targetUserId) {
        return new Response(JSON.stringify({ error: 'targetUserId required for draft mode' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      contextUserId = body.targetUserId;
    }

    // Load conversation history scoped to the current session (so "new chat" really starts fresh)
    let history: IncomingMsg[] = body.history ?? [];
    if (history.length === 0) {
      let q = adminClient
        .from('user_messages')
        .select('message, from_admin, is_ai, created_at, session_id')
        .eq('user_id', contextUserId)
        .order('created_at', { ascending: true })
        .limit(40);
      if (body.sessionId) q = q.eq('session_id', body.sessionId);
      const { data: msgs } = await q;
      history = (msgs ?? []).map((m: any) => ({
        role: m.from_admin ? 'assistant' : 'user',
        content: m.message,
      }));
    }

    const lastUserText = body.message || (history.length ? history[history.length - 1]?.content : '') || '';

    const [ctx, knowledge] = await Promise.all([
      loadUserContext(adminClient, contextUserId),
      loadKnowledge(adminClient, lastUserText),
    ]);

    const systemPrompt = buildSystemPrompt(ctx, knowledge, mode === 'draft');

    // Build chat messages array for the gateway
    const chatMessages: IncomingMsg[] = [...history];
    if (body.message && mode === 'reply') {
      chatMessages.push({ role: 'user', content: body.message });
    }
    if (mode === 'draft') {
      // Ask the model to draft the next admin reply
      chatMessages.push({
        role: 'user',
        content: '[INTERNAL] Draft the next reply from the admin team to this user. Output only the message text — no quotes, no explanation.',
      });
    }

    // For 'reply' mode, persist the user message right away so it shows in admin
    if (mode === 'reply' && body.message?.trim()) {
      await adminClient.from('user_messages').insert({
        user_id: callerId,
        subject: 'Chat Message',
        message: body.message.trim(),
        from_admin: false,
        is_ai: false,
        session_id: body.sessionId ?? null,
      });
    }

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages,
        ],
        stream: false,
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error('AI gateway error', aiResp.status, text);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds in workspace settings.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    let replyText: string = aiJson?.choices?.[0]?.message?.content?.trim() || '';

    // Detect handoff token
    const handoff = replyText.includes(HANDOFF_TOKEN);
    if (handoff) {
      replyText = replyText.replace(HANDOFF_TOKEN, '').trim();
      if (!replyText) {
        replyText = "Let me connect you with a teammate — they'll reach out by email shortly.";
      }
    }

    // For 'reply' mode: persist assistant message so admin sees the AI reply
    if (mode === 'reply' && replyText) {
      await adminClient.from('user_messages').insert({
        user_id: callerId,
        subject: 'Chat Message',
        message: replyText,
        from_admin: true,
        is_ai: true,
        read_status: false,
        session_id: body.sessionId ?? null,
        handoff_requested: handoff,
      });
    }

    // Fire handoff email (don't block response)
    if (handoff && mode === 'reply') {
      const profile = ctx.profile as any;
      notifyHumanHandoff({
        resendKey: Deno.env.get('RESEND_API_KEY'),
        userName: profile?.full_name || 'Unknown user',
        userEmail: profile?.email || userData.user.email || '—',
        userPhone: profile?.phone || '—',
        question: body.message || '(no message)',
        sessionId: body.sessionId,
      }).catch((e) => console.error('handoff email error', e));
    }

    return new Response(JSON.stringify({ reply: replyText, mode, handoff }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('support-chat error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
