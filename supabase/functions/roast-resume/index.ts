import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const roastResumeSchema = z.object({
  resume_content: z.string().min(10).max(100000),
  job_description: z.string().min(10).max(50000),
  roast_type: z.enum(['friendly', 'hr', 'senior', 'dark']).default('senior'),
  language: z.enum(['english', 'hinglish']).default('english'),
})

// Rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 10
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
        console.log(`Gemini API busy (${response.status}), retrying... (${attempt + 1}/${maxRetries})`)
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

function getToneInstructions(roastType: string, language: string): string {
  const tones: Record<string, string> = {
    friendly: `TONE: Be supportive and encouraging, like a helpful friend. Still be honest about issues, but frame them positively. Use phrases like "You're on the right track, but..." and "One thing that could help is..."`,
    hr: `TONE: Be professional and formal, like an actual HR recruiter reviewing resumes. Use corporate language. Be direct about what works and what doesn't from a hiring perspective.`,
    senior: `TONE: Be brutally honest like a senior developer or tech lead doing a code review. No sugarcoating. Call out BS directly. Use phrases like "Look, here's the problem..." and "This won't fly because..."`,
    dark: `TONE: Be savage and roast mercilessly. Use dark humor. Be harsh but still useful. Think of it like a comedy roast where the goal is brutal honesty wrapped in savage humor. No personal attacks, just brutal truth about the resume.`
  }

  const langInstructions = language === 'hinglish' 
    ? `LANGUAGE: Write in Hinglish (mix of Hindi and English). Use phrases like "Bhai, ye dekh...", "Yaar, problem ye hai ki...", "Seedha baat - ". Keep it natural and conversational like how young Indians speak.`
    : `LANGUAGE: Write in clear, conversational English.`

  return `${tones[roastType] || tones.senior}\n\n${langInstructions}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const clientId = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(clientId)) {
    console.warn(`Rate limit exceeded for client: ${clientId}`)
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
    )
  }

  try {
    const rawBody = await req.json()
    const { resume_content, job_description, roast_type, language } = roastResumeSchema.parse(rawBody)

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log(`Starting resume roast - Type: ${roast_type}, Language: ${language}`)

    const toneInstructions = getToneInstructions(roast_type, language)

    const roastPrompt = `You are a resume reviewer who tells job seekers the TRUTH about why they're not getting interviews.

${toneInstructions}

RESUME CONTENT:
${resume_content}

JOB DESCRIPTION:
${job_description}

Analyze this resume against the job description and return a JSON response in this EXACT format:

{
  "shortlist_probability": <number 0-100, be REALISTIC - most resumes score 20-60>,
  "verdict": "<APPLY | DON'T APPLY | MAYBE>",
  "verdict_reason": "<one sentence explaining your verdict in the specified tone>",
  "top_3_rejection_reasons": [
    "<most likely reason recruiter will reject this resume>",
    "<second most likely reason>",
    "<third most likely reason>"
  ],
  "ats_score": <number 0-100>,
  "keyword_match_percent": <number 0-100>,
  "keyword_gaps": ["<missing keyword 1>", "<missing keyword 2>", ...up to 10],
  "sections": {
    "summary": {
      "score": <0-100>,
      "roast": "<feedback on summary section>",
      "severity": "<brutal | harsh | mild>"
    },
    "skills": {
      "score": <0-100>,
      "roast": "<feedback on skills section>",
      "missing_skills": ["<skill from JD not in resume>", ...up to 5]
    },
    "experience": {
      "score": <0-100>,
      "roast": "<feedback on experience>",
      "weak_bullets": ["<weak bullet point>", ...up to 3]
    },
    "projects": {
      "score": <0-100>,
      "roast": "<feedback on projects, or note if missing>"
    },
    "formatting": {
      "score": <0-100>,
      "roast": "<ATS formatting feedback>",
      "issues": ["<specific issue>", ...up to 3]
    }
  },
  "jd_mismatch": {
    "missing_requirements": ["<required thing from JD not in resume>", ...up to 5],
    "irrelevant_content": ["<thing in resume that doesn't help>", ...up to 3]
  },
  "overall_roast": "<2-3 sentence summary of why this resume will/won't get shortlisted>"
}

SCORING GUIDELINES:
- shortlist_probability: 80+ = excellent match, 50-70 = decent, below 40 = unlikely
- Be harsh but fair. Most resumes should score 30-55 unless genuinely excellent.
- If key requirements are missing, score below 40.

Return ONLY the JSON, no markdown formatting, no code blocks.`

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: roastPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096
        }
      }
    )

    if (!geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    const responseText = geminiResponse.candidates[0].content.parts[0].text
    let roastData

    try {
      let cleanText = responseText.trim()
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        roastData = JSON.parse(jsonMatch[0])
      } else {
        roastData = JSON.parse(cleanText)
      }
    } catch (parseError) {
      console.error('Failed to parse roast response:', responseText)
      // Fallback roast
      roastData = {
        shortlist_probability: 35,
        verdict: "MAYBE",
        verdict_reason: "Your resume needs work to stand out for this role.",
        top_3_rejection_reasons: [
          "Missing key skills from the job description",
          "Bullets don't show measurable impact",
          "Resume doesn't align well with the role"
        ],
        ats_score: 50,
        keyword_match_percent: 40,
        keyword_gaps: ["Could not analyze specific keywords"],
        sections: {
          summary: { score: 50, roast: "Summary needs more punch and relevance to the role.", severity: "harsh" },
          skills: { score: 50, roast: "Skills section needs better JD alignment.", missing_skills: [] },
          experience: { score: 50, roast: "Experience bullets lack impact metrics.", weak_bullets: [] },
          projects: { score: 50, roast: "Projects could better showcase relevant work." },
          formatting: { score: 60, roast: "Formatting is acceptable but could be cleaner.", issues: [] }
        },
        jd_mismatch: {
          missing_requirements: ["Review JD for specific requirements"],
          irrelevant_content: []
        },
        overall_roast: "This resume needs optimization. Focus on tailoring content to the job and quantifying achievements."
      }
    }

    console.log('Roast complete:', roastData.verdict, roastData.shortlist_probability)

    return new Response(
      JSON.stringify({ success: true, roast: roastData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in roast-resume function:', error)
    return new Response(
      JSON.stringify({ error: errorMessage, details: 'Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})