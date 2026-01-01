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

    // Generate a magic link and use the email_otp to create a server-side session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError) {
      console.error('Error generating magic link:', linkError)
      throw linkError
    }

    const emailOtp = linkData?.properties?.email_otp
    if (!emailOtp) {
      throw new Error('Missing email_otp from generated magic link')
    }

    // Create a proper session by verifying the email OTP
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: verifyData, error: verifyError } = await supabaseClient.auth.verifyOtp({
      email,
      token: emailOtp,
      type: 'email',
    })

    if (verifyError) {
      console.error('Error verifying email OTP:', verifyError)
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in sync-clerk-user:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
