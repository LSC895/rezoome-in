import { z } from 'zod';
import type { RoastRequest } from './types';

export const MAX_RESUME_CHARS = 50_000;
export const MIN_RESUME_CHARS = 30;

export const RoastRequestSchema = z.object({
  resumeText: z
    .string()
    .min(MIN_RESUME_CHARS, `resumeText must be at least ${MIN_RESUME_CHARS} chars`)
    .max(MAX_RESUME_CHARS, `resumeText must be ${MAX_RESUME_CHARS} chars or fewer`) // safety limit
    .refine((s) => !/(<svg|<script|data:image\/|application\/pdf|base64,)/i.test(s), {
      message: 'resumeText contains prohibited content',
    }),
  jobDescription: z.string().max(30_000).optional(),
  tone: z.enum(['friendly', 'hr', 'senior', 'dark']),
  language: z.enum(['english', 'hinglish']),
});

export function validateRoastRequest(data: unknown): { success: true; data: RoastRequest } | { success: false; errors: string[] } {
  const result = RoastRequestSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}

// -------------------
// AI response validation
// -------------------
export const RoastResponseSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(['Apply', "Don't Apply", 'High Risk']),
  roast: z.object({
    summary: z.string(),
    skills: z.string(),
    projects: z.string(),
    experience: z.string(),
    formatting: z.string(),
  }),
  atsMatch: z.object({
    percentage: z.number().min(0).max(100),
    missingSkills: z.array(z.string()),
  }),
  fixes: z.object({
    summaryFix: z.string(),
    bulletFixes: z.array(z.string()),
  }),
});

export function validateRoastResponse(data: unknown): { success: true; data: unknown } | { success: false; errors: string[] } {
  const result = RoastResponseSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}
