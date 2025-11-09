-- Create enum for resume data status
CREATE TYPE public.cv_parse_status AS ENUM ('pending', 'parsed', 'reviewed', 'active');

-- Create master_cv_data table for structured resume information
CREATE TABLE public.master_cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Professional Information
  professional_summary TEXT,
  
  -- Structured Data (JSONB for flexibility)
  work_experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  technical_skills JSONB DEFAULT '{}'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  original_filename TEXT,
  parse_status cv_parse_status DEFAULT 'pending',
  last_parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.master_cv_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own master CV"
  ON public.master_cv_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own master CV"
  ON public.master_cv_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own master CV"
  ON public.master_cv_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own master CV"
  ON public.master_cv_data FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_master_cv_data_updated_at
  BEFORE UPDATE ON public.master_cv_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();