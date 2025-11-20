import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      
      // Success
      if (response.ok) return response;
      
      // Rate limit - wait and retry
      if (response.status === 429 && i < maxRetries) {
        const waitTime = 1000 * (2 ** i); // 1s, 2s
        console.log(`Rate limited (429), retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      // Server error - retry once
      if (response.status >= 500 && i < maxRetries) {
        console.log(`Server error ${response.status}, retrying... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      
      // Other errors - don't retry
      return response;
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`Network error, retrying... (attempt ${i + 1}/${maxRetries}):`, error);
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
    const { resumeText, filename } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    console.log('Parsing resume with filename:', filename);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const extractionPrompt = `You are an expert resume parser. Extract ALL information from this resume into structured JSON.

CRITICAL RULES:
- Extract REAL data only from the resume, never add placeholders or make up information
- If a field is not present in the resume, use null
- Parse dates carefully (use format "Month YYYY" or "Month YYYY - Month YYYY" or "Present")
- Extract quantifiable achievements with numbers where present
- Preserve all technical skills, tools, and technologies mentioned
- Extract complete job descriptions and responsibilities

ADDITIONAL PARSING RULES:
- If you see a date range like "Jan 2020 - Dec 2022", split it into start_date: "January 2020" and end_date: "December 2022"
- For phone numbers, keep the EXACT format from the resume (including country code like +1 if present)
- For URLs (LinkedIn, GitHub, Portfolio), ensure they start with https:// or http:// - add https:// if missing
- For skills, categorize them properly:
  * languages: Programming languages (JavaScript, Python, Java, etc.)
  * frameworks: Frameworks and libraries (React, Node.js, Django, etc.)
  * tools: Development tools (Git, Docker, VS Code, etc.)
  * cloud: Cloud platforms (AWS, Azure, GCP, etc.)
- Extract ALL numbers, percentages, and dollar amounts from achievement descriptions (e.g., "increased revenue by 40%" or "managed $2M budget")
- If you're unsure about a field, use null instead of guessing or using placeholder text

QUALITY CHECKLIST (validate before returning):
1. Contact info is complete (at least full_name and email must be present)
2. All dates follow "Month YYYY" format (e.g., "January 2020" not "01/2020" or "2020-01")
3. Each work experience has at least one achievement in the achievements array
4. Skills are categorized into languages, frameworks, tools, cloud (not just a flat list)
5. No placeholder text like "example.com", "Your Name", "john.doe@email.com", etc.

REQUIRED OUTPUT FORMAT (valid JSON only):
{
  "contact": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, State",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username",
    "portfolio": "https://portfolio.com"
  },
  "summary": "Professional summary paragraph from resume...",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "start_date": "January 2020",
      "end_date": "Present",
      "is_current": true,
      "achievements": [
        "Led team of 8 engineers to build X, resulting in 40% increase in Y",
        "Architected Z using A, B, C, reducing costs by $50K annually"
      ]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "graduation_date": "May 2018",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python", "Java"],
    "frameworks": ["React", "Node.js", "Django"],
    "tools": ["Git", "Docker", "AWS"],
    "cloud": ["AWS", "Azure", "GCP"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project",
      "technologies": ["React", "Node.js"],
      "outcomes": "What was achieved"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "June 2021",
      "credential_id": "ABC123"
    }
  ],
  "achievements": [
    {
      "title": "Achievement title",
      "description": "Description of achievement",
      "date": "2020"
    }
  ]
}

RESUME TEXT TO PARSE:
${resumeText}

OUTPUT ONLY VALID JSON, NO MARKDOWN OR EXPLANATIONS:`;

    console.log('Calling Gemini API for parsing...');

    const geminiResponse = await callGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: extractionPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
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
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No generated text from Gemini API');
      throw new Error('Failed to parse resume - no response from AI');
    }

    console.log('Generated text length:', generatedText.length);

    // Extract JSON from potential markdown code blocks
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('JSON text:', jsonText.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Successfully parsed resume data');

    // Transform to database schema
    const transformedData = {
      full_name: parsedData.contact?.full_name || null,
      email: parsedData.contact?.email || null,
      phone: parsedData.contact?.phone || null,
      location: parsedData.contact?.location || null,
      linkedin_url: parsedData.contact?.linkedin || null,
      github_url: parsedData.contact?.github || null,
      portfolio_url: parsedData.contact?.portfolio || null,
      professional_summary: parsedData.summary || null,
      work_experience: parsedData.experience || [],
      education: parsedData.education || [],
      technical_skills: parsedData.skills || {},
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      achievements: parsedData.achievements || [],
      original_filename: filename,
      parse_status: 'parsed',
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in parse-master-cv:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
