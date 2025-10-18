import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const contactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
}).optional();

const generateContentSchema = z.object({
  job_description: z.string().min(10).max(10000),
  original_resume: z.string().min(10).max(50000),
  template: z.enum(['professional', 'modern', 'creative', 'classic']).optional(),
  contact_info: contactInfoSchema,
  include_cover_letter: z.boolean().optional(),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get and validate auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    
    // Defensively strip empty contact_info fields before validation
    if (body?.contact_info && typeof body.contact_info === 'object') {
      for (const key of ['name', 'email', 'phone', 'linkedin']) {
        const value = body.contact_info[key];
        if (typeof value === 'string' && value.trim() === '') {
          delete body.contact_info[key];
        }
      }
      if (Object.keys(body.contact_info).length === 0) {
        delete body.contact_info;
      }
    }
    
    const validatedData = generateContentSchema.parse(body);

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build prompt
    const templateStyles = {
      professional: 'Use a clean, traditional format with clear sections and professional language.',
      modern: 'Use a contemporary format with strategic use of formatting and impactful language.',
      creative: 'Use an innovative format that showcases personality while maintaining professionalism.',
      classic: 'Use a traditional, time-tested format with conservative styling and formal language.',
    };

    const templateStyle = templateStyles[validatedData.template || 'modern'];

    const systemPrompt = `You are an elite ATS resume optimization specialist with expertise in creating 10/10 resumes that pass all applicant tracking systems and impress hiring managers.

CRITICAL RULES - NEVER BREAK THESE:
1. ABSOLUTELY NO PLACEHOLDERS - Never use [Previous Company], [City, Country], [Start Date], [End Date], [Your Degree], or ANY bracket placeholders
2. USE ONLY REAL DATA - Extract and use ACTUAL company names, dates, locations, technologies, and metrics from the original resume
3. IF INFORMATION IS MISSING - Either omit that detail gracefully or use the exact information provided without adding brackets
4. PRESERVE ALL SPECIFIC DETAILS - Keep real company names, exact dates, actual cities, precise numbers, and technology names
5. CREATE SHARE-READY CONTENT - The resume must be immediately usable without any editing needed

ATS OPTIMIZATION REQUIREMENTS:
1. Parse the job description to identify: required skills, preferred technologies, key responsibilities, required experience level, industry-specific keywords
2. Extract from master CV: All technical skills, all tools/technologies used, all quantifiable achievements (numbers, percentages, metrics), all certifications, actual company names and dates, real project details
3. Strategically place keywords: Use exact keywords from job description in skills section, naturally integrate keywords into bullet points, match terminology used in job posting (e.g., if they say "Kubernetes" don't say "K8s")
4. Optimize formatting for ATS: Use standard section headers (SUMMARY, EXPERIENCE, SKILLS, EDUCATION, CERTIFICATIONS), use simple bullet points (•), avoid tables, columns, or complex formatting, use standard date formats (Month YYYY - Month YYYY)
5. Quantify everything possible: Add metrics to every bullet point where possible (%, $, time saved, scale), show impact and results, not just responsibilities
6. ${templateStyle}

STRUCTURE AND CONTENT QUALITY:
1. SUMMARY (3-4 lines): Start with years of experience + key specialization, list 3-4 most relevant skills for THIS job, add 1-2 major quantifiable achievements, end with value proposition aligned to job posting
2. EXPERIENCE: Use strong action verbs (Architected, Orchestrated, Spearheaded, Engineered, Optimized, Implemented), every bullet must have measurable impact, tailor each role's bullets to highlight relevant experience, prioritize most relevant achievements at top of each role
3. SKILLS: Group by category (e.g., Cloud Platforms, DevOps Tools, Languages), list most job-relevant skills first, use exact terminology from job description
4. EDUCATION & CERTIFICATIONS: List relevant certifications prominently, include actual degree names and institutions from master CV

KEYWORD DENSITY: Aim for 2-3% keyword density from job description without keyword stuffing`;

    const userPrompt = `JOB DESCRIPTION TO TAILOR FOR:
${validatedData.job_description}

MASTER CV / ORIGINAL RESUME (USE ALL REAL DATA FROM THIS):
${validatedData.original_resume}

${validatedData.contact_info ? `CONTACT INFORMATION (USE THESE EXACT DETAILS):
Name: ${validatedData.contact_info.name || 'Not provided'}
Email: ${validatedData.contact_info.email || 'Not provided'}
Phone: ${validatedData.contact_info.phone || 'Not provided'}
LinkedIn: ${validatedData.contact_info.linkedin || 'Not provided'}` : ''}

YOUR TASK:
1. Analyze the job description and extract all critical keywords, required skills, and qualifications
2. Review the master CV and identify all relevant experience, skills, and achievements that match the job
3. Create a highly tailored, ATS-optimized resume that:
   - Uses ONLY real information from the master CV (no placeholders!)
   - Strategically highlights the most relevant experience for THIS specific job
   - Incorporates job description keywords naturally throughout
   - Quantifies all achievements with specific metrics
   - Is immediately ready to submit (no editing needed)
${validatedData.include_cover_letter ? '4. Write a compelling, personalized cover letter (350-400 words) that:\n   - Opens with enthusiasm for the specific role and company\n   - Connects 2-3 key experiences from the CV to job requirements\n   - Shows understanding of company/role challenges\n   - Closes with strong call to action' : ''}

RETURN FORMAT (valid JSON only):
{
  "resume": "Full tailored resume with REAL data, no placeholders, immediately shareable",
  "cover_letter": ${validatedData.include_cover_letter ? '"Personalized cover letter"' : 'null'},
  "ats_score": 90,
  "contact_info": {
    "name": "Actual name from contact info or CV",
    "email": "actual@email.com",
    "phone": "+actual-phone",
    "linkedin": "actual-linkedin-url"
  }
}

REMEMBER: This resume must be a 10/10 - ATS-optimized, perfectly tailored, using only real information, and 100% ready to submit!`;

    // Call Gemini API with retry logic
    let attempts = 0;
    let geminiResponse;
    
    while (attempts < 3) {
      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: systemPrompt },
                  { text: userPrompt }
                ]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (geminiResponse.status === 503) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }

        break;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      const errorText = await geminiResponse?.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to generate content with AI');
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse AI response
    let parsedContent;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedContent = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Store in database
    const { data: insertData, error: insertError } = await supabase
      .from('generated_resumes')
      .insert({
        user_id: user.id,
        job_description: validatedData.job_description,
        generated_content: parsedContent.resume,
        cover_letter: parsedContent.cover_letter,
        contact_info: parsedContent.contact_info,
        template: validatedData.template || 'modern',
        ats_optimization_score: parsedContent.ats_score,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save generated content');
    }

    return new Response(
      JSON.stringify({
        resume: {
          id: insertData.id,
          content: parsedContent.resume,
          cover_letter: parsedContent.cover_letter,
          contact_info: parsedContent.contact_info,
          ats_score: parsedContent.ats_score,
          template: insertData.template,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});