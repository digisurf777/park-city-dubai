import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminDocumentRequest {
  verification_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    const { verification_id }: AdminDocumentRequest = await req.json();

    console.log('Admin document access request:', {
      verification_id,
      user_id: user.id
    });

    // Call the database function to get document info and verify admin access
    const { data, error } = await supabase.rpc('admin_get_document_url', {
      verification_id
    });

    if (error) {
      console.error('Database function error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error('Failed to get document information');
    }

    // Generate signed URL for the document (15 minutes expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(data.document_image_url.replace(/^.*verification-docs\//, ''), 900); // 15 minutes

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
    }

    console.log('Document access granted successfully');

    return new Response(JSON.stringify({
      success: true,
      signed_url: signedUrlData.signedUrl,
      document_type: data.document_type,
      full_name: data.full_name,
      verification_status: data.verification_status,
      expires_at: data.expires_at
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in admin-get-document function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);