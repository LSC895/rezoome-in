// frontend/src/lib/env.ts
// Frontend env vars (Vite prefers VITE_*, this maps REACT_APP_* and VITE_*).
const get = (k: string) => (import.meta.env?.[k as any] ?? (process.env as any)?.[k])

export const REACT_APP_CLERK_KEY = (get('REACT_APP_CLERK_KEY') ?? get('VITE_CLERK_KEY') ?? '') as string
export const REACT_APP_GEMINI_API_KEY = (get('REACT_APP_GEMINI_API_KEY') ?? get('VITE_GEMINI_API_KEY') ?? '') as string
export const REACT_APP_SUPABASE_URL = (get('REACT_APP_SUPABASE_URL') ?? get('VITE_SUPABASE_URL') ?? '') as string
export const REACT_APP_SUPABASE_ANON_KEY = (get('REACT_APP_SUPABASE_ANON_KEY') ?? get('VITE_SUPABASE_ANON_KEY') ?? '') as string
