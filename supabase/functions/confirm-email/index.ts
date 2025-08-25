import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmEmailRequest {
  token: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase admin client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { token, email }: ConfirmEmailRequest = await req.json();

    if (!token || !email) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Missing token or email'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error fetching users:', getUserError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Failed to verify confirmation token'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'User not found'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Email is already confirmed'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the confirmation token
    const storedToken = user.user_metadata?.confirmation_token;
    const tokenExpires = user.user_metadata?.confirmation_expires;
    
    if (!storedToken || storedToken !== token) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Invalid confirmation token'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if token has expired
    if (tokenExpires && new Date() > new Date(tokenExpires)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Confirmation token has expired. Please request a new confirmation email.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Confirm the user's email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirmed_at: new Date().toISOString(),
      user_metadata: {
        ...user.user_metadata,
        confirmation_token: null, // Clear the token
        confirmation_expires: null
      }
    });

    if (confirmError) {
      console.error('Error confirming email:', confirmError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Failed to confirm email'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email confirmed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in confirm-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);