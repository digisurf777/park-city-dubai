import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { verification_id, access_token } = await req.json()

    if (!verification_id) {
      console.error('Missing verification_id')
      return new Response(
        JSON.stringify({ error: 'Missing verification_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('Invalid token:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Secure document access requested by user ${user.id} for verification ${verification_id}`)

    // Use the secure document access function with encrypted references
    const { data: secureAccess, error: accessError } = await supabaseClient.rpc(
      'get_secure_document_reference',
      { verification_id }
    )

    if (accessError) {
      console.error('Failed to get secure document reference:', accessError)
      return new Response(
        JSON.stringify({ 
          error: 'Document access denied',
          details: accessError.message 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!secureAccess || secureAccess.length === 0) {
      console.error('No secure reference found for verification:', verification_id)
      return new Response(
        JSON.stringify({ error: 'Document reference not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const reference = secureAccess[0]

    // Generate a temporary access token (valid for 5 minutes)
    const tempToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store the temporary token in the database
    const { error: tokenError } = await supabaseClient
      .from('encrypted_document_refs')
      .update({
        document_access_token: tempToken,
        token_expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
        access_count: supabaseClient.raw('access_count + 1')
      })
      .eq('id', reference.encrypted_ref_id)

    if (tokenError) {
      console.error('Failed to create access token:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to create secure access' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Secure access granted for verification ${verification_id}, expires at ${expiresAt}`)

    return new Response(
      JSON.stringify({
        success: true,
        access_token: tempToken,
        expires_at: expiresAt.toISOString(),
        security_level: reference.security_level,
        access_method: 'encrypted_reference_only',
        verification_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in secure document access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})