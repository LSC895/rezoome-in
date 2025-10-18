import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clerkUserId, email, fullName } = await req.json()

    if (!clerkUserId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkUserId or email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user exists by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      console.log('User already exists:', userId)
    } else {
      // Create new Supabase user with a secure random password
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName || '',
          clerk_user_id: clerkUserId
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      userId = newUser.user.id
      console.log('Created new user:', userId)
    }

    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (sessionError) {
      console.error('Error generating session:', sessionError)
      throw sessionError
    }

    // Create a proper session by signing in
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Use OTP to create session
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${req.headers.get('origin') || ''}/`
      }
    })

    if (otpError) {
      console.error('Error generating OTP:', otpError)
      throw otpError
    }

    // Extract the token from the magic link
    const url = new URL(otpData.properties.action_link)
    const token = url.searchParams.get('token')
    const tokenHash = url.searchParams.get('token_hash')

    if (!token || !tokenHash) {
      throw new Error('Failed to extract token from magic link')
    }

    // Verify the OTP and create session
    const { data: verifyData, error: verifyError } = await supabaseClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    })

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError)
      throw verifyError
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: verifyData.session,
        user: verifyData.user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in sync-clerk-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
