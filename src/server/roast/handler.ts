import express from 'express';
import type { Request, Response } from 'express';
import { validateRoastRequest, validateRoastResponse } from './validation';
import { hitRateLimit, DEFAULT_RATE_LIMIT } from './rateLimiter';
import { callGemini } from './gemini';
import type { RoastRequest, RoastResponse } from './types';

const VERDICT_RULES = (score: number) => {
  if (score >= 70) return 'Apply';
  if (score >= 40) return "Don't Apply";
  return 'High Risk';
};

function getClientIp(req: Request) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string') return xf.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function buildPrompt(body: RoastRequest) {
  // Strict prompt asking for JSON-only output with explicit schema
  return `You are an objective recruiter-level resume evaluator.\n
Always follow these hard rules:\n
1) DO NOT invent or add facts (no companies, companies' names, dates, metrics, or accomplishments that do not exist in the provided resume).\n2) Use the following strict rubric for scoring: formatting (10%), skills & ATS match (25%), projects (25%), experience & metrics (25%), language & grammar (15%). Score MUST be integer between 0 and 100.\n3) Tone affects wording only; scoring must remain objective.\n4) Output JSON ONLY, with this exact schema (no extra fields):\n
{
  "score": number,
  "verdict": "Apply" | "Don't Apply" | "High Risk",
  "roast": {
    "summary": string,
    "skills": string,
    "projects": string,
    "experience": string,
    "formatting": string
  },
  "atsMatch": {
    "percentage": number,
    "missingSkills": string[]
  },
  "fixes": {
    "summaryFix": string,
    "bulletFixes": string[]
  }
}\n
Resume: """${body.resumeText.replace(/"""/g, '"\"\"')}"""\n
JobDescription: """${(body.jobDescription ?? '').replace(/"""/g, '"\"\"')}"""\n
Tone: ${body.tone}\n
Language: ${body.language}\n
Be decisive in the verdict. If you cannot compute a field, return a short message but still adhere to the JSON schema. Do not include any analysis outside the JSON object.`;
}

function extractJson(text: string): string | null {
  // Try to find the first { ... } JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return match[0];
}

export async function roastHandler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = hitRateLimit(ip, DEFAULT_RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
  if (!rl.ok) return res.status(429).json({ error: 'Rate limit exceeded' });

  const body = req.body;
  const val = validateRoastRequest(body);
  if (!val.success) return res.status(400).json({ error: 'Invalid input', details: val.errors });

  // Build prompt and call Gemini
  const prompt = buildPrompt(val.data);
  let aiText: string;
  try {
    aiText = await callGemini(prompt);
  } catch (err: any) {
    console.error('Gemini call failed', err?.message ?? err);
    return res.status(502).json({ error: 'AI service error' });
  }

  // Extract and parse JSON
  const jsonText = extractJson(aiText) || aiText;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error('Failed to parse AI output as JSON', { aiText });
    return res.status(502).json({ error: 'Invalid AI response format' });
  }

  const out = validateRoastResponse(parsed);
  if (!out.success) {
    console.error('AI response failed schema validation', out.errors);
    return res.status(502).json({ error: 'AI response validation failed', details: out.errors });
  }

  // Ensure verdict consistent with score (if model gave odd verdict, prefer model but if missing, compute)
  const resp = parsed as RoastResponse;
  if (!resp.verdict) {
    (resp as any).verdict = VERDICT_RULES(resp.score);
  }

  // Final safety checks: score ranges etc are already enforced by schema
  return res.status(200).json(resp);
}

// Express wrapper for simple local dev / deployment on Railway
export function createRoastRouter() {
  const router = express.Router();
  router.post('/', async (req: Request, res: Response) => roastHandler(req, res));
  router.all('/', (_req: Request, res: Response) => res.status(405).json({ error: 'Method Not Allowed' }));
  return router;
}

// Vercel-compatible serverless handler (export default)
export default async function handler(req: any, res: any) {
  // Reuse the same logic; Vercel/Serverless envs provide a Node/Express-compatible req/res
  return roastHandler(req as Request, res as Response);
}
