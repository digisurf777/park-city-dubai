import { serve } from "jsr:@std/http";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Edge function called:', req.method, req.url);
  
  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS OPTIONS request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('Processing upload request...');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    console.log('Verifying token...');
    
    // Verify JWT with service role client
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in form data');
      return new Response(
        JSON.stringify({ error: 'No file provided' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('File received:', file.name, file.type, file.size);

    // Parse additional form data
    const fullName = formData.get('full_name') as string;
    const nationality = formData.get('nationality') as string;
    const documentType = formData.get('document_type') as string;

    if (!fullName || !documentType) {
      console.error('Missing required fields:', { fullName: !!fullName, documentType: !!documentType });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: full_name and document_type are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Form data parsed:', { fullName, nationality, documentType });

    // Generate unique storage path
    const fileId = crypto.randomUUID();
    const storagePath = `${user.id}/${fileId}-${file.name}`;

    console.log('Uploading file to:', storagePath);

    // Upload file to verification bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      return new Response(
        JSON.stringify({ error: 'File upload failed', details: uploadError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('File uploaded successfully');

    // Insert record into documents table
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        mime_type: file.type,
        bucket_id: 'verification',
        storage_path: storagePath,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      
      // Cleanup: Delete uploaded file if DB insert fails
      try {
        await supabase.storage
          .from('verification')
          .remove([storagePath]);
        console.log('Cleanup: Removed orphaned file');
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to save document record', details: dbError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Document record created');

    // Create or update verification record
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_verifications')
      .upsert({
        user_id: user.id,
        full_name: fullName,
        nationality: nationality,
        document_type: documentType,
        document_image_url: storagePath,
        verification_status: 'pending'
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Verification record creation failed:', verificationError);
      
      // Cleanup: Delete uploaded file and document record
      try {
        await supabase.storage.from('verification').remove([storagePath]);
        await supabase.from('documents').delete().eq('id', documentData.id);
        console.log('Cleanup: Removed orphaned file and document record');
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create verification record', details: verificationError.message }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verification record created');

    // Send admin notification
    try {
      const { error: notificationError } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          type: 'verification_submitted',
          user_id: user.id,
          full_name: fullName,
          document_type: documentType
        }
      });

      if (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
        // Don't fail the upload for notification errors
      } else {
        console.log('Admin notification sent successfully');
      }
    } catch (notificationError) {
      console.error('Exception sending admin notification:', notificationError);
      // Don't fail the upload for notification errors
    }

    console.log('Document and verification uploaded successfully');

    // Return success response with both records
    return new Response(
      JSON.stringify({ 
        success: true, 
        document: documentData,
        verification: verificationData,
        message: 'Document uploaded and verification submitted successfully'
      }), 
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});