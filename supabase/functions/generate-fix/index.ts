import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateFixSchema = z.object({
  resume_content: z.string().min(10).max(100000),
  job_description: z.string().min(10).max(50000),
  include_cover_letter: z.boolean().optional().default(false)
})

// Rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 5
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

async function callGeminiWithRetry(url: string, body: any, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      if (response.status === 503 || response.status === 429) {
        console.log(`Gemini API busy, retrying... (${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
        continue
      }
      
      const errorText = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${errorText}`)
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)))
      }
    }
  }
  
  throw lastError || new Error('Failed after retries')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const clientId = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(clientId)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    )
  }

  try {
    const rawBody = await req.json()
    const { resume_content, job_description, include_cover_letter } = generateFixSchema.parse(rawBody)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Generating full resume fix...')

    const fixPrompt = `You are an expert resume writer who transforms weak resumes into ATS-optimized, interview-winning documents. Your job is to completely REWRITE the resume to perfectly match the job description.

ORIGINAL RESUME:
${resume_content}

TARGET JOB DESCRIPTION:
${job_description}

REWRITE THIS RESUME following these rules:

1. SUMMARY (2-3 lines):
   - Start with years of experience + primary role
   - Highlight 2-3 key achievements relevant to THIS job
   - Include 2-3 keywords from the job description naturally

2. KEY SKILLS (one line, 6-8 skills):
   - Extract the most important skills from the JD
   - Only include skills the candidate actually has
   - Format: Skill 1 | Skill 2 | Skill 3 | Skill 4 | Skill 5 | Skill 6

3. EXPERIENCE:
   - Keep same companies and dates
   - REWRITE every bullet point using Action → Impact → Result format
   - Quantify achievements (add realistic numbers if missing)
   - Inject keywords from JD naturally into bullets
   - 3-4 bullets per role

4. PROJECTS (if any):
   - One-line description with technologies used
   - Highlight impact/result

5. EDUCATION:
   - Keep existing education
   - Format: Degree | Institution | Year

6. CERTIFICATIONS (if any):
   - List relevant certifications

FORMATTING RULES:
- Use plain text only (no tables, columns, or special characters)
- Clear section headers in CAPS
- One blank line between sections
- Bullet points start with action verbs
- Keep to 1 page for <5 years experience, 2 pages max otherwise

Return the COMPLETE rewritten resume as plain text, ready to copy-paste. Do not include any commentary or explanations.`

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: fixPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 4096
        }
      }
    )

    if (!geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    const fixedResume = geminiResponse.candidates[0].content.parts[0].text.trim()
    let coverLetter = null

    // Generate cover letter if requested
    if (include_cover_letter) {
      console.log('Generating cover letter...')
      
      const coverLetterPrompt = `Based on this resume and job description, write a compelling cover letter.

RESUME:
${fixedResume}

JOB DESCRIPTION:
${job_description}

Write a professional cover letter that:
1. Opens with enthusiasm for the specific role
2. Highlights 2-3 most relevant achievements
3. Shows knowledge of the company/role
4. Ends with a clear call to action
5. Keep it to 3-4 paragraphs, under 300 words

Return ONLY the cover letter text, no commentary.`

      const coverLetterResponse = await callGeminiWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: coverLetterPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        }
      )

      if (coverLetterResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
        coverLetter = coverLetterResponse.candidates[0].content.parts[0].text.trim()
      }
    }

    // Quick ATS analysis of the fixed resume
    const atsPrompt = `Analyze this resume against the job description and return a JSON with:
{
  "ats_score": <0-100>,
  "keyword_match_percent": <0-100>,
  "matched_keywords": ["keyword1", "keyword2", ...],
  "improvements_made": ["improvement1", "improvement2", ...]
}

RESUME:
${fixedResume}

JOB DESCRIPTION:
${job_description}

Return ONLY JSON.`

    const atsResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: atsPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      }
    )

    let atsAnalysis = { ats_score: 85, keyword_match_percent: 80, matched_keywords: [], improvements_made: [] }
    
    try {
      const atsText = atsResponse.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleanAts = atsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const jsonMatch = cleanAts.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        atsAnalysis = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.log('ATS analysis parse error, using defaults')
    }

    console.log('Fix generation complete. ATS Score:', atsAnalysis.ats_score)

    return new Response(
      JSON.stringify({
        success: true,
        fixed_resume: fixedResume,
        cover_letter: coverLetter,
        ats_analysis: atsAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in generate-fix function:', error)
    return new Response(
      JSON.stringify({ error: errorMessage, details: 'Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
