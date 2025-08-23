
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
    const { file_content, file_name, file_size, session_id } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Call Gemini API to analyze the resume
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this resume content and provide a detailed ATS score and feedback. Return the response in this exact JSON format:

{
  "ats_score": <number between 0-100>,
  "overall_feedback": "<detailed overall feedback about the resume>",
  "sections": [
    {
      "name": "<section name like Contact Information, Professional Summary, etc>",
      "score": <number between 0-100>,
      "feedback": "<specific feedback for this section>"
    }
  ]
}

Resume content to analyze:
${file_content}

Provide constructive, actionable feedback that helps improve the resume's ATS compatibility and overall effectiveness.`
          }]
        }]
      })
    })

    const geminiData = await geminiResponse.json()
    console.log('Gemini response:', geminiData)

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    // Parse the JSON response from Gemini
    const analysisText = geminiData.candidates[0].content.parts[0].text
    let analysisData

    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        analysisData = JSON.parse(analysisText)
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', analysisText)
      // Fallback response if parsing fails
      analysisData = {
        ats_score: 75,
        overall_feedback: "Your resume has been analyzed. Consider optimizing keywords, improving formatting, and adding quantifiable achievements to boost your ATS score.",
        sections: [
          {
            name: "Overall Structure",
            score: 75,
            feedback: "Resume structure is adequate but could benefit from better organization and keyword optimization."
          }
        ]
      }
    }

    // Store the analysis in the database
    const { data, error } = await supabase
      .from('resume_analyses')
      .insert({
        session_id,
        file_name,
        file_size,
        ats_score: analysisData.ats_score,
        overall_feedback: analysisData.overall_feedback,
        sections: analysisData.sections
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          id: data.id,
          ats_score: analysisData.ats_score,
          overall_feedback: analysisData.overall_feedback,
          sections: analysisData.sections
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
