
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const analyzeResumeSchema = z.object({
  file_content: z.string().min(10).max(100000),
  file_name: z.string().min(1).max(255),
  file_size: z.number().min(1).max(10485760), // 10MB max
  session_id: z.string().uuid()
})

// Rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 20 // Max 20 requests per minute
const RATE_WINDOW = 60000

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(clientId)
  
  if (!record || now - record.timestamp > RATE_WINDOW) {
    requestCounts.set(clientId, { count: 1, timestamp: now })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(clientId)) {
    console.warn(`Rate limit exceeded for client: ${clientId}`)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429 
      }
    )
  }

  try {
    // Parse and validate input with Zod
    const rawBody = await req.json()
    const validatedInput = analyzeResumeSchema.parse(rawBody)
    
    const { file_content, file_name, file_size, session_id } = validatedInput

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('Gemini API key not configured')
      throw new Error('Gemini API key not configured')
    }

    console.log('Analyzing resume with Gemini API...')

    // Call Gemini API to analyze the resume with retry logic
    let geminiResponse
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please analyze this resume content and provide a detailed ATS score and constructive feedback. Be encouraging but honest, and focus on actionable improvements. Return the response in this exact JSON format:

{
  "ats_score": <number between 0-100>,
  "overall_feedback": "<encouraging and constructive overall feedback about the resume>",
  "sections": [
    {
      "name": "<section name like Contact Information, Professional Summary, etc>",
      "score": <number between 0-100>,
      "feedback": "<specific, actionable feedback for this section>"
    }
  ]
}

When scoring sections, please be fair and realistic. If content is visible and readable (even if formatting could be improved), score it based on the actual content quality, not just format issues. For example:
- Contact info that exists should score 70-90+ depending on completeness
- Professional summaries that highlight relevant skills should score 60-80+  
- Experience sections with job titles, companies, and responsibilities should score 60-85+
- Education with degree/school info should score 70-90+
- Skills sections with relevant technologies should score 65-85+

Focus on content quality and ATS optimization rather than perfect formatting. Be constructive and encouraging while providing specific improvement suggestions.

Resume content to analyze:
${file_content}

Provide helpful, actionable feedback that motivates improvement while acknowledging existing strengths.`
              }]
            }]
          })
        })

        if (geminiResponse.ok) {
          break
        } else if (geminiResponse.status === 503) {
          retryCount++
          console.log(`Gemini API overloaded, retrying... (${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)) // Exponential backoff
        } else {
          throw new Error(`Gemini API error: ${geminiResponse.status}`)
        }
      } catch (error) {
        retryCount++
        console.error(`Attempt ${retryCount} failed:`, error)
        if (retryCount >= maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      throw new Error('Failed to get response from Gemini API after retries')
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received:', JSON.stringify(geminiData, null, 2))

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', geminiData)
      throw new Error('Invalid response from Gemini API')
    }

    // Parse the JSON response from Gemini
    const analysisText = geminiData.candidates[0].content.parts[0].text
    let analysisData

    try {
      // Clean the response text and extract JSON
      let cleanText = analysisText.trim()
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Extract JSON from the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        analysisData = JSON.parse(cleanText)
      }

      // Validate the parsed data
      if (!analysisData.ats_score || !analysisData.overall_feedback || !Array.isArray(analysisData.sections)) {
        throw new Error('Invalid analysis data structure')
      }

    } catch (parseError) {
      console.error('Failed to parse Gemini response:', analysisText)
      console.error('Parse error:', parseError)
      
      // Improved fallback response
      analysisData = {
        ats_score: 65,
        overall_feedback: "Your resume shows good potential! While I encountered a technical issue analyzing the specific formatting, I can see you have relevant experience and skills. Focus on using industry keywords, quantifying your achievements with numbers, and ensuring clean formatting. Consider using standard section headers and bullet points for better ATS compatibility.",
        sections: [
          {
            name: "Overall Structure",
            score: 65,
            feedback: "Your resume has a solid foundation. To improve ATS compatibility, ensure you use standard section headers like 'Experience', 'Education', and 'Skills'. Use consistent formatting and include relevant keywords from job descriptions you're targeting."
          },
          {
            name: "Content Quality",
            score: 70,
            feedback: "Focus on quantifying your achievements with specific numbers and percentages. Use action verbs to start bullet points and highlight the impact you made in previous roles."
          }
        ]
      }
    }

    console.log('Final analysis data:', analysisData)

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

    console.log('Analysis stored successfully:', data.id)

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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in analyze-resume function:', error)
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Please try again in a few moments. The AI service may be temporarily busy.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
