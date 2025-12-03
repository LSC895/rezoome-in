import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry logic for Gemini API with exponential backoff
async function callGeminiWithRetry(url: string, body: any, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) return response;
      
      if (response.status === 429 && i < maxRetries) {
        const waitTime = 1000 * (2 ** i);
        console.log(`Rate limited (429), retrying in ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      if (response.status >= 500 && i < maxRetries) {
        console.log(`Server error ${response.status}, retrying...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`Network error, retrying...`, error);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { master_cv_data, job_description, template = 'modern', include_cover_letter = false } = await req.json();

    if (!job_description || !master_cv_data) {
      throw new Error('Missing required fields: job_description and master_cv_data');
    }

    console.log('Generating preview with template:', template);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build structured context from master CV data
    const structuredContext = {
      contact: {
        name: master_cv_data.full_name,
        email: master_cv_data.email,
        phone: master_cv_data.phone,
        location: master_cv_data.location,
        linkedin: master_cv_data.linkedin_url,
        github: master_cv_data.github_url,
        portfolio: master_cv_data.portfolio_url
      },
      summary: master_cv_data.professional_summary,
      experience: master_cv_data.work_experience,
      skills: master_cv_data.technical_skills,
      education: master_cv_data.education,
      projects: master_cv_data.projects,
      certifications: master_cv_data.certifications,
      achievements: master_cv_data.achievements
    };

    // IMPROVED ATS-OPTIMIZED PROMPT
    const systemPrompt = `You are an expert ATS resume writer who creates job-winning, recruiter-ready resumes.

INPUT: Structured master CV data (JSON) and a target job description.
OUTPUT: A perfectly tailored, ATS-optimized resume in clean text format.

=== CRITICAL RESUME WRITING RULES ===

1. FORMAT & STRUCTURE:
   - Use ATS-safe formatting: NO tables, NO icons, NO graphics, NO columns
   - Clean text-only layout with clear section headers
   - Standard sections in this order: CONTACT INFO → PROFESSIONAL SUMMARY → KEY SKILLS → WORK EXPERIENCE → PROJECTS → EDUCATION
   - Use consistent formatting throughout

2. PROFESSIONAL SUMMARY (3-4 lines):
   - Lead with years of experience + primary expertise
   - Include 2-3 job-specific keywords naturally
   - End with a measurable achievement or value proposition

3. KEY SKILLS SECTION:
   - List 10-15 skills that directly match the job requirements
   - Group by category (Technical, Tools, Soft Skills)
   - Prioritize skills mentioned in the job description

4. WORK EXPERIENCE (Action → Impact → Result):
   - Start every bullet with a STRONG ACTION VERB (Led, Engineered, Optimized, Delivered, Architected, Transformed, etc.)
   - QUANTIFY results wherever possible: percentages, dollar amounts, time saved, users impacted
   - Format: [Action Verb] + [What you did] + [Measurable Result/Impact]
   
   EXAMPLES of strong bullets:
   ✓ "Engineered automated testing framework that reduced QA time by 60% and caught 40% more bugs pre-release"
   ✓ "Led cross-functional team of 8 engineers to deliver $2M platform migration 3 weeks ahead of schedule"
   ✓ "Optimized database queries resulting in 45% faster page load times and 99.9% uptime"
   
   AVOID weak bullets like:
   ✗ "Responsible for testing"
   ✗ "Worked on various projects"
   ✗ "Helped with code reviews"

5. KEYWORD OPTIMIZATION:
   - Extract 15-20 keywords from the job description
   - Naturally integrate them throughout the resume
   - Match exact phrases when possible (e.g., "CI/CD pipelines" not just "automation")
   - Include both acronyms and full terms (AWS and Amazon Web Services)

6. TAILORING RULES:
   - Select the 3-4 most relevant work experiences for this specific job
   - Reorder bullet points to prioritize job-relevant achievements
   - Adapt language to match the job description's tone
   - Insert missing skills ONLY if they align with the candidate's actual experience
   - Do NOT invent fake experience or achievements

7. LENGTH:
   - 1 page for <10 years experience
   - 2 pages max for 10+ years

TEMPLATE STYLE: ${template}
${template === 'modern' ? '- Clean, minimal with clear visual hierarchy' : ''}
${template === 'professional' ? '- Traditional format emphasizing career progression' : ''}
${template === 'creative' ? '- Slightly more expressive language while maintaining professionalism' : ''}
${template === 'technical' ? '- Technical projects and skills prominently featured' : ''}

=== JOB DESCRIPTION ===
${job_description}

=== CANDIDATE DATA ===
${JSON.stringify(structuredContext, null, 2)}

Generate a polished, ATS-optimized, recruiter-ready resume. Output ONLY the resume text (no markdown, no code blocks, no JSON):`;

    console.log('Calling Gemini API...');

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      if (geminiResponse.status === 429) {
        throw new Error('Rate limits exceeded, please try again later.');
      }
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedResume = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedResume) {
      throw new Error('Failed to generate resume');
    }

    console.log('Resume generated, length:', generatedResume.length);

    // Generate cover letter if requested
    let coverLetter = null;
    if (include_cover_letter) {
      console.log('Generating cover letter...');
      
      const coverLetterPrompt = `Generate a compelling, professional cover letter for this job application.

JOB DESCRIPTION:
${job_description}

CANDIDATE DATA:
Name: ${master_cv_data.full_name}
Contact: ${master_cv_data.email} | ${master_cv_data.phone}
Summary: ${master_cv_data.professional_summary}
Recent Experience: ${JSON.stringify(master_cv_data.work_experience?.slice(0, 2) || [])}
Key Skills: ${JSON.stringify(master_cv_data.technical_skills)}

COVER LETTER REQUIREMENTS:
1. Use the EXACT contact information provided above
2. Address specific requirements from the job description
3. Highlight 2-3 most relevant achievements with quantified results
4. Show genuine enthusiasm for the role and company
5. 3-4 paragraphs: Opening hook → Body with qualifications → Strong closing with call to action
6. Professional but personable tone
7. Include proper letter formatting with date

Output ONLY the cover letter text:`;

      const coverLetterResponse = await callGeminiWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: coverLetterPrompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          }
        }
      );

      if (coverLetterResponse.ok) {
        const coverLetterData = await coverLetterResponse.json();
        coverLetter = coverLetterData.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Cover letter generated');
      }
    }

    // Calculate a more meaningful ATS score based on keyword matching
    const jobKeywords = job_description.toLowerCase().split(/\s+/);
    const resumeText = generatedResume.toLowerCase();
    const matchedKeywords = jobKeywords.filter((kw: string) => 
      kw.length > 3 && resumeText.includes(kw)
    ).length;
    const atsScore = Math.min(98, Math.max(75, 70 + Math.floor(matchedKeywords / 3)));

    return new Response(
      JSON.stringify({
        resume: {
          content: generatedResume,
          cover_letter: coverLetter,
          ats_score: atsScore,
          template: template,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-preview:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
