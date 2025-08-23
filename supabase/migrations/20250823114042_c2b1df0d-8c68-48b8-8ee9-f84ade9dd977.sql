
-- Create table for storing resume analyses
CREATE TABLE public.resume_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  ats_score INTEGER NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
  overall_feedback TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing generated resumes
CREATE TABLE public.generated_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  job_description TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  ats_optimization_score INTEGER DEFAULT 94,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user sessions (to track anonymous users)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access since we're using session-based tracking)
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (session-based)
CREATE POLICY "Public access to resume analyses" 
  ON public.resume_analyses 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Public access to generated resumes" 
  ON public.generated_resumes 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Public access to user sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_resume_analyses_session_id ON public.resume_analyses(session_id);
CREATE INDEX idx_generated_resumes_session_id ON public.generated_resumes(session_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
