import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()
    
    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Creating/updating admin user:', email)

    let userId: string
    let userExists = false

    // Try to create user first, then handle if they already exist
    console.log('Attempting to create user:', email)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createError) {
      // Check if user already exists
      if (createError.message?.includes('already registered') || 
          createError.message?.includes('User already registered') ||
          createError.message?.includes('already exists')) {
        
        console.log('User exists, attempting to find and update...')
        userExists = true
        
        // List all users to find the existing one (since getUserByEmail doesn't exist)
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
          console.error('Error listing users:', listError)
          return new Response(
            JSON.stringify({ error: 'Failed to find existing user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const existingUser = users.users.find(u => u.email === email)
        
        if (!existingUser) {
          return new Response(
            JSON.stringify({ error: 'User exists but could not be found' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        userId = existingUser.id
        
        // Update existing user's password and confirm email
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            password,
            email_confirm: true
          }
        )

        if (updateError) {
          console.error('Error updating existing user:', updateError)
          
          // Handle specific error types
          if (updateError.message?.includes('weak_password') || updateError.code === 'weak_password') {
            return new Response(
              JSON.stringify({ 
                error: 'Password is too weak. Password must contain uppercase, lowercase, numbers, and special characters.' 
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          
          return new Response(
            JSON.stringify({ error: 'Failed to update user: ' + updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log('Successfully updated existing user:', userId)
        
      } else {
        // Other creation errors
        console.error('Error creating user:', createError)
        
        // Handle specific error types
        if (createError.message?.includes('weak_password') || createError.code === 'weak_password') {
          return new Response(
            JSON.stringify({ 
              error: 'Password is too weak. Password must contain uppercase, lowercase, numbers, and special characters.' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to create user: ' + createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Successfully created new user
      userId = newUser.user.id
      console.log('Successfully created new user:', userId)
    }

    // Upsert profile with proper conflict resolution
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        user_id: userId, 
        full_name: 'Admin User', 
        user_type: 'seeker' 
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to create profile: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully upserted profile for user:', userId)

    // Add admin role with proper conflict resolution
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, {
        onConflict: 'user_id,role'
      })

    if (roleError) {
      console.error('Error adding admin role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Failed to add admin role: ' + roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully added admin role for user:', userId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: userExists ? 'Admin user updated successfully' : 'Admin user created successfully',
        userId,
        email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-or-update-admin function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})