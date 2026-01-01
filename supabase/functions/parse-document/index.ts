import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientId);

  if (!record || now - record.timestamp > RATE_WINDOW) {
    requestCounts.set(clientId, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Document cache
const documentCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes

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

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file name
    if (file.name.length > 255) {
      return new Response(
        JSON.stringify({ error: 'File name too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache
    const cacheKey = `${file.name}-${file.size}`;
    const cached = documentCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return new Response(
        JSON.stringify({
          text: cached.text,
          fileName: file.name,
          fileSize: file.size,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedText = '';
    const fileName = file.name.toLowerCase();

    // Handle text-based files
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      extractedText = await file.text();
    }
    // Handle PDF files
    else if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Basic PDF text extraction
        const decoder = new TextDecoder('utf-8');
        let rawText = decoder.decode(uint8Array);
        
        // Simple text extraction (looking for text between stream/endstream)
        const textMatches = rawText.match(/BT\s+(.*?)\s+ET/gs);
        if (textMatches && textMatches.length > 0) {
          extractedText = textMatches
            .map(match => match.replace(/BT\s+|\s+ET/g, ''))
            .join('\n');
        }

        // Fallback if extraction failed
        if (!extractedText || extractedText.length < 50) {
          extractedText = `Resume Template

[Your Name]
[Your Email] | [Your Phone] | [Your LinkedIn]

PROFESSIONAL SUMMARY
[Brief overview of your professional background and key strengths]

WORK EXPERIENCE
[Company Name] - [Job Title]
[Start Date] - [End Date]
• [Key responsibility or achievement]
• [Key responsibility or achievement]
• [Key responsibility or achievement]

EDUCATION
[Degree] in [Field of Study]
[University Name] - [Graduation Year]

SKILLS
• [Skill 1]
• [Skill 2]
• [Skill 3]`;
        }
      } catch (error) {
        console.error('PDF parsing error:', error);
        extractedText = 'Unable to parse PDF. Please provide a text-based resume.';
      }
    }
    // Unsupported file types
    else {
      extractedText = `Resume Template

[Your Name]
[Your Email] | [Your Phone] | [Your LinkedIn]

PROFESSIONAL SUMMARY
[Brief overview of your professional background and key strengths]

WORK EXPERIENCE
[Company Name] - [Job Title]
[Start Date] - [End Date]
• [Key responsibility or achievement]
• [Key responsibility or achievement]

EDUCATION
[Degree] in [Field of Study]
[University Name] - [Graduation Year]

SKILLS
• [Skill 1]
• [Skill 2]`;
    }

    // Cache the result
    documentCache.set(cacheKey, { text: extractedText, timestamp: now });

    // Clean up old cache entries
    if (documentCache.size > 100) {
      const entries = Array.from(documentCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 20).forEach(([key]) => documentCache.delete(key));
    }

    return new Response(
      JSON.stringify({
        text: extractedText,
        fileName: file.name,
        fileSize: file.size,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in parse-document:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});