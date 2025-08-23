
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      // Check if session exists in localStorage
      let storedSessionId = localStorage.getItem('resume_session_id');
      
      if (!storedSessionId) {
        // Create new session
        try {
          const { data, error } = await supabase.functions.invoke('create-session');
          
          if (error) throw error;
          
          storedSessionId = data.session_id;
          localStorage.setItem('resume_session_id', storedSessionId);
        } catch (error) {
          console.error('Failed to create session:', error);
          // Fallback to client-side generated session
          storedSessionId = crypto.randomUUID();
          localStorage.setItem('resume_session_id', storedSessionId);
        }
      }
      
      setSessionId(storedSessionId);
      setIsLoading(false);
    };

    initSession();
  }, []);

  return { sessionId, isLoading };
};
