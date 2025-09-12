-- Fix critical security vulnerability: Remove public access and implement session-based RLS

-- Drop existing public access policies that expose all data
DROP POLICY IF EXISTS "Public access to generated resumes" ON public.generated_resumes;
DROP POLICY IF EXISTS "Public access to resume analyses" ON public.resume_analyses;  
DROP POLICY IF EXISTS "Public access to user sessions" ON public.user_sessions;

-- Create session-based RLS policies for generated_resumes
-- Allow access only through application with session context
CREATE POLICY "Allow session-based access to generated resumes"
ON public.generated_resumes
FOR ALL
USING (
  -- Allow access when session_id matches the current session context
  -- This requires the application to set the session context
  session_id = current_setting('app.current_session_id', true)
);

-- Create session-based RLS policies for resume_analyses  
CREATE POLICY "Allow session-based access to resume analyses"
ON public.resume_analyses
FOR ALL
USING (
  session_id = current_setting('app.current_session_id', true)
);

-- Create session-based RLS policies for user_sessions
-- Allow users to create new sessions and access their own session
CREATE POLICY "Allow session creation and access"
ON public.user_sessions
FOR ALL
USING (
  session_id = current_setting('app.current_session_id', true)
);

-- Allow INSERT for new sessions (needed for session creation)
CREATE POLICY "Allow new session creation"
ON public.user_sessions  
FOR INSERT
WITH CHECK (true);

-- Add performance indexes for session-based queries
CREATE INDEX IF NOT EXISTS idx_generated_resumes_session_id ON public.generated_resumes(session_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_session_id ON public.resume_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);