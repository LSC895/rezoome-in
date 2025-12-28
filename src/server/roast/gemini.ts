const DEFAULT_TIMEOUT = 20_000;

function devMockResponse(): string {
  // Realistic placeholder data for local dev when Gemini env vars are missing
  const mock = {
    score: 62,
    verdict: "Don't Apply",
    roast: {
      summary: 'Resume shows relevant tech but lacks metrics and clear impact statements.',
      skills: 'Skills listed but not prioritized for ATS; missing keywords like TypeScript and Node.js for many roles.',
      projects: 'Projects include technical work but lack measurable outcomes and clear role descriptions.',
      experience: 'Experience section is brief and missing quantifiable results.',
      formatting: 'Formatting is inconsistent: mixed bullet styles and spacing; consider uniform bullets and clear headers.'
    },
    atsMatch: {
      percentage: 42,
      missingSkills: ['TypeScript', 'Node.js']
    },
    fixes: {
      summaryFix: 'Rewrite the summary to highlight measurable impact and include role-focused keywords.',
      bulletFixes: [
        'Start bullets with strong action verbs and include numbers where possible.',
        'Add missing keywords from the job description to improve ATS match.',
        'Standardize formatting: consistent bullets, fonts, and header styles.'
      ]
    }
  };
  // Return compact JSON string (models often return JSON-only text)
  return JSON.stringify(mock);
}

export async function callGemini(prompt: string, timeout = DEFAULT_TIMEOUT): Promise<string> {
  const url = process.env.GEMINI_API_URL;
  const key = process.env.GEMINI_API_KEY;
  const forceMock = process.env.DEV_MOCK_GEMINI === 'true';

  if (forceMock) {
    // explicit dev toggle
    console.warn('DEV_MOCK_GEMINI=true — using local mock response for /api/roast (no external call)');
    return devMockResponse();
  }

  if (!url || !key) {
    // Local dev mode fallback — warn and return a mock JSON response
    // NOTE: This avoids making real network calls and allows local testing without secrets
    // eslint-disable-next-line no-console
    console.warn('GEMINI_API_URL or GEMINI_API_KEY not set — using local mock response for /api/roast');
    return devMockResponse();
  }

  // If we reach here, we will call the real Gemini endpoint
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Calling Gemini endpoint:', url);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        // Minimal generic payload; adapt to your chosen Gemini endpoint's schema
        input: prompt,
        // you may set model parameters here (max tokens etc.) via env or fixed values
        max_output_tokens: 800,
        temperature: 0.0,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini returned ${res.status}: ${text}`);
    }

    const text = await res.text();
    return text;
  } finally {
    clearTimeout(timer);
  }
}
