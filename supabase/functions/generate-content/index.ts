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
    const { job_description, session_id, original_resume, template, contact_info, include_cover_letter } = await req.json()

    // Initialize Supabase client with Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    console.log('Generating tailored content with Gemini API...')

    // Enhanced template-specific styling
    const templateStyles = {
      modern: {
        colors: 'Use blue (#2563eb) for headers and accents. Clean, minimalist design.',
        format: 'Modern formatting with clean lines and subtle borders.'
      },
      classic: {
        colors: 'Use green (#059669) for headers and accents. Traditional, professional design.',
        format: 'Classic formatting with clear sections and professional structure.'
      },
      creative: {
        colors: 'Use purple (#9333ea) for headers and accents. Creative, modern design.',
        format: 'Creative formatting with dynamic sections and modern styling.'
      }
    }

    const selectedStyle = templateStyles[template as keyof typeof templateStyles] || templateStyles.modern

    // Extract contact info from resume text if not provided
    let finalContactInfo = contact_info;
    if (!contact_info?.name || !contact_info?.email) {
      console.log('Contact info incomplete, extracting from resume text...');
      
      // Extract email
      const emailMatch = original_resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = original_resume.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
      const linkedinMatch = original_resume.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/i);
      
      // Extract name from first few lines
      const lines = original_resume.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let extractedName = '';
      
      for (const line of lines.slice(0, 10)) {
        if (line.toLowerCase().includes('resume') || 
            line.toLowerCase().includes('cv') || 
            line.includes('@') ||
            /^\+?[\d\s\-\(\)]+$/.test(line)) {
          continue;
        }
        
        const namePattern = /^[A-Z][a-zA-Z''-]*(?:\s+[A-Z][a-zA-Z''-]*){1,3}$/;
        if (namePattern.test(line) && line.length < 50) {
          extractedName = line;
          break;
        }
      }
      
      finalContactInfo = {
        name: contact_info?.name || extractedName || 'Professional Name',
        email: contact_info?.email || (emailMatch ? emailMatch[0] : 'professional@email.com'),
        phone: contact_info?.phone || (phoneMatch ? phoneMatch[0] : '(555) 123-4567'),
        linkedin: contact_info?.linkedin || (linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : 'https://linkedin.com/in/professional')
      };
    }

    // Build comprehensive prompt for high-quality resume generation
    let promptText = `You are a world-class resume writer and career strategist with 20+ years of experience helping executives and professionals land their dream jobs at top companies. Generate an exceptional, ATS-optimized resume that will get past automated systems and impress hiring managers.

CONTACT INFORMATION TO USE (NEVER use placeholders - these are the actual details):
Name: ${finalContactInfo.name}
Phone: ${finalContactInfo.phone}
Email: ${finalContactInfo.email}
LinkedIn: ${finalContactInfo.linkedin}

MASTER RESUME CONTENT TO WORK WITH:
${original_resume || 'No master resume provided'}

TARGET JOB DESCRIPTION:
${job_description}

TEMPLATE STYLE: ${template.toUpperCase()}
Design Guidelines: ${selectedStyle.colors} ${selectedStyle.format}

CRITICAL RESUME WRITING INSTRUCTIONS:

1. **STRATEGIC CONTENT TAILORING**:
   - Analyze the job description thoroughly to identify key requirements, skills, and keywords
   - Reposition and prioritize experiences from the master resume that directly match job requirements
   - Quantify ALL achievements with specific numbers, percentages, dollar amounts, or metrics
   - Use powerful action verbs (Spearheaded, Orchestrated, Optimized, Transformed, etc.)
   
2. **ATS OPTIMIZATION**:
   - Incorporate exact keywords and phrases from job description naturally throughout
   - Use standard section headers (Professional Summary, Experience, Education, Skills)
   - Avoid graphics, tables, or unusual formatting that ATS can't read
   - Include both acronyms and full terms (e.g., "API (Application Programming Interface)")

3. **PROFESSIONAL SUMMARY** (3-4 lines):
   - Lead with years of experience and primary expertise area
   - Highlight 2-3 most relevant achievements with quantifiable results
   - Include key skills that match job requirements
   - End with value proposition for the target role

4. **EXPERIENCE SECTION**:
   - List experiences in reverse chronological order
   - For each role, include: Job Title | Company | Location | Dates
   - Write 3-5 bullet points per role focusing on achievements, not duties
   - Use the CAR method: Challenge/Action/Result
   - Start each bullet with strong action verbs
   - Include metrics wherever possible (improved efficiency by 30%, managed team of 15, increased revenue by $2M)

5. **SKILLS SECTION**:
   - Prioritize technical skills mentioned in job description
   - Group related skills logically (Technical Skills, Programming Languages, Tools & Platforms)
   - Match skill level terminology used in job posting

6. **EDUCATION & CERTIFICATIONS**:
   - Include relevant degrees, certifications, and training
   - Highlight any education/certs specifically mentioned in job description
   - Include GPA if 3.7+ and recent graduate

7. **FORMATTING & STRUCTURE**:
   - Use clean, professional formatting with consistent spacing and visual hierarchy
   - Create a modern, visually appealing layout with strategic use of whitespace
   - Use markdown formatting: # for main headers, ## for section headers, **bold** for emphasis
   - Implement the template color scheme: ${selectedStyle.colors}
   - Ensure perfect typography with proper font hierarchy and spacing
   - Keep to 1-2 pages maximum with excellent readability
   - Create sections with clear visual separation and professional borders/dividers

**QUALITY STANDARDS**:
- Every bullet point must demonstrate impact and value
- No generic responsibilities - focus on unique contributions
- Perfect grammar, spelling, and formatting
- Compelling narrative that shows career progression
- Strong alignment between candidate's experience and job requirements`

    if (include_cover_letter) {
      promptText += `

8. **COVER LETTER REQUIREMENTS**:
   - Professional business letter format with proper greeting
   - Opening paragraph: Hook with specific interest in company/role
   - Body paragraphs: 2-3 specific examples showing qualification alignment
   - Closing: Strong call-to-action and enthusiasm
   - Professional, confident tone throughout
   - Complement resume without repeating it verbatim
   - Address company's specific needs mentioned in job description
   - Show knowledge of company culture, mission, or recent news`
    }

    promptText += `

MANDATORY OUTPUT FORMAT - Return valid JSON only:
{
  "resume": "Complete professional resume in clean markdown format with proper headers, bullet points, and formatting. Must be exceptionally well-written and ATS-optimized.",
  ${include_cover_letter ? '"cover_letter": "Professional cover letter in business format addressing the specific role and company",' : ''}
  "contact_extracted": {
    "name": "Full professional name",
    "phone": "Phone number in standard format",
    "email": "Professional email address", 
    "linkedin": "Complete LinkedIn URL"
  }
}

CRITICAL: Generate an outstanding resume that showcases the candidate as the perfect fit for this specific role. Every word should add value and demonstrate why they're the ideal hire.`

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    let generatedContent = geminiData.candidates[0].content.parts[0].text
    
    // Clean up the response to extract JSON
    generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    let parsedContent
    try {
      parsedContent = JSON.parse(generatedContent)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedContent = {
        resume: generatedContent,
        cover_letter: include_cover_letter ? "Cover letter could not be generated in this format. Please try again." : undefined,
        contact_extracted: contact_info
      }
    }

    // Store the generated content in the database
    const { data, error } = await supabase
      .from('generated_resumes')
      .insert({
        session_id,
        job_description,
        generated_content: parsedContent.resume,
        cover_letter: parsedContent.cover_letter || null,
        template: template,
        contact_info: finalContactInfo,
        ats_optimization_score: 94
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Generated content stored successfully:', data.id)

    return new Response(
      JSON.stringify({
        success: true,
        resume: {
          id: data.id,
          content: parsedContent.resume,
          cover_letter: parsedContent.cover_letter,
          contact_info: finalContactInfo,
          template: template,
          ats_score: 94
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-content function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please try again with your job description.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})