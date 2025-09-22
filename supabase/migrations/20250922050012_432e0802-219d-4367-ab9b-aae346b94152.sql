-- Fix RLS policies for generated_resumes and resume_analyses tables to prevent unauthorized access

-- First, let's create a more secure session validation function
CREATE OR REPLACE FUNCTION public.validate_session_access(table_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    current_session text;
    session_exists boolean;
BEGIN
    -- Get the current session from context
    current_session := current_setting('app.current_session_id', true);
    
    -- Return false if no session context is set
    IF current_session IS NULL OR current_session = '' THEN
        RETURN false;
    END IF;
    
    -- Return false if trying to access different session data
    IF table_session_id != current_session THEN
        RETURN false;
    END IF;
    
    -- Verify the session exists in user_sessions table and is recent (within 24 hours)
    SELECT EXISTS(
        SELECT 1 FROM public.user_sessions 
        WHERE session_id = current_session 
        AND last_activity > (now() - interval '24 hours')
    ) INTO session_exists;
    
    RETURN session_exists;
END;
$$;

-- Update RLS policy for generated_resumes to use the validation function
DROP POLICY IF EXISTS "Allow session-based access to generated resumes" ON public.generated_resumes;

CREATE POLICY "Secure session-based access to generated resumes" 
ON public.generated_resumes 
FOR ALL 
USING (public.validate_session_access(session_id))
WITH CHECK (public.validate_session_access(session_id));

-- Update RLS policy for resume_analyses to use the validation function  
DROP POLICY IF EXISTS "Allow session-based access to resume analyses" ON public.resume_analyses;

CREATE POLICY "Secure session-based access to resume analyses"
ON public.resume_analyses
FOR ALL
USING (public.validate_session_access(session_id))
WITH CHECK (public.validate_session_access(session_id));

-- Add policy to ensure user_sessions table is properly secured
DROP POLICY IF EXISTS "Allow session creation and access" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow new session creation" ON public.user_sessions;

CREATE POLICY "Secure session access"
ON public.user_sessions
FOR ALL
USING (session_id = current_setting('app.current_session_id', true))
WITH CHECK (session_id = current_setting('app.current_session_id', true));

-- Add function to clean up old sessions (for security)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Delete sessions older than 7 days
    DELETE FROM public.user_sessions 
    WHERE last_activity < (now() - interval '7 days');
    
    -- Delete associated resume data for cleaned up sessions
    DELETE FROM public.generated_resumes 
    WHERE session_id NOT IN (SELECT session_id FROM public.user_sessions);
    
    DELETE FROM public.resume_analyses 
    WHERE session_id NOT IN (SELECT session_id FROM public.user_sessions);
END;
$$;