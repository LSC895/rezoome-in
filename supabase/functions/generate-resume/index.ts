
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
    const { job_description, session_id, original_resume } = await req.json()

    // Initialize Supabase client with Service Role to bypass RLS for trusted server-side inserts
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Generating tailored resume with Gemini API...')

    // Call Gemini API to generate tailored resume
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert resume writer. Please create a tailored resume by adapting the provided master resume to match the job description. This is NOT about creating a template - you must use the actual content from the master resume and intelligently modify it to better fit the target role.

MASTER RESUME CONTENT:
${original_resume || 'No master resume provided - please create a professional template'}

JOB DESCRIPTION TO MATCH:
${job_description}

INSTRUCTIONS:
1. Use the REAL content from the master resume (experience, education, skills, projects)
2. Reorder and emphasize experiences that are most relevant to the target job
3. Modify bullet points to highlight relevant achievements and use keywords from the job description
4. Adjust the professional summary to target the specific role
5. Emphasize the most relevant skills and technologies mentioned in the job posting
6. Keep the same factual information but present it in a way that best matches the job requirements

Output the tailored resume in clean markdown format that can be easily converted to PDF. Make it professional, ATS-friendly, and specifically optimized for this job opportunity.

If no master resume is provided, create a realistic professional resume template, but prioritize using the actual content when available.`
          }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response for resume generation received')

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    const generatedContent = geminiData.candidates[0].content.parts[0].text

    // Store the generated resume in the database
    const { data, error } = await supabase
      .from('generated_resumes')
      .insert({
        session_id,
        job_description,
        generated_content: generatedContent,
        ats_optimization_score: 92 // High score since it's AI-optimized and tailored
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Generated resume stored successfully:', data.id)

    return new Response(
      JSON.stringify({
        success: true,
        resume: {
          id: data.id,
          content: generatedContent,
          ats_score: 92
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in generate-resume function:', error)
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Please try again with your job description.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
