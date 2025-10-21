import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('User is not an admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Not an admin', message: 'Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check Authentication Assurance Level (AAL) from JWT claims to avoid session race conditions
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const decodeJwt = (t: string) => {
      try {
        const payload = t.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const json = atob(padded);
        return JSON.parse(json);
      } catch (e) {
        console.warn('JWT decode failed', e);
        return null;
      }
    };
    const claims: any = bearer ? decodeJwt(bearer) : null;
    // AMR can be strings or objects like { method: 'totp', timestamp: ... }
    const rawAmr = Array.isArray(claims?.amr) ? claims.amr : [];
    const amr = rawAmr.map((v: any) => (typeof v === 'string' ? v : v?.method)).filter(Boolean);
    const tokenAAL = claims?.aal as string | undefined;
    const mfaSatisfied = tokenAAL === 'aal2' || amr.includes('mfa') || amr.includes('otp') || amr.includes('totp') || amr.includes('sms') || amr.includes('webauthn');

    console.log('Admin access check - User:', user.id, 'AAL (token):', tokenAAL, 'AMR:', amr);

    if (!mfaSatisfied) {
      console.warn('Admin attempted access without MFA (AAL2). Token AAL:', tokenAAL, 'AMR:', amr);
      return new Response(
        JSON.stringify({ 
          error: 'MFA required',
          message: 'Admin access requires two-factor authentication',
          requires_mfa: true,
          current_aal: tokenAAL,
          amr
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All checks passed
    console.log('Admin access validated successfully for user:', user.id);
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: user.id,
        aal: tokenAAL ?? 'aal2',
        message: 'Access granted'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
