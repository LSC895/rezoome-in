
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratedResume {
  id: string;
  content: string;
  ats_score: number;
}

export const useResumeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const { toast } = useToast();

  const generateResume = async (jobDescription: string, sessionId: string) => {
    setIsGenerating(true);
    
    try {
      // Get original resume content from localStorage
      const originalResume = localStorage.getItem('originalResumeContent') || '';
      
      const { data, error } = await supabase.functions.invoke('generate-resume', {
        body: {
          job_description: jobDescription,
          session_id: sessionId,
          original_resume: originalResume
        }
      });

      if (error) throw error;

      setGeneratedResume(data.resume);
      
      toast({
        title: "Resume generated! ✨",
        description: "Your job-specific resume is ready for download.",
      });

      return data.resume;
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation failed",
        description: "Please try again with a different job description.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateResume,
    isGenerating,
    generatedResume,
    setGeneratedResume
  };
};
