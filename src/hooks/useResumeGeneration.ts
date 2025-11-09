import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface GeneratedResume {
  id: string;
  content: string;
  cover_letter?: string;
  contact_info?: ContactInfo;
  template: string;
  ats_score: number;
}

export const useResumeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const { toast } = useToast();

  const generateResume = async (
    jobDescription: string, 
    template: string = 'modern',
    includeCoverLetter: boolean = false
  ) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          job_description: jobDescription,
          template: template,
          include_cover_letter: includeCoverLetter
        }
      });

      if (error) throw error;

      setGeneratedResume(data.resume);
      
      toast({
        title: includeCoverLetter ? "Resume & Cover Letter generated! ✨" : "Resume generated! ✨",
        description: includeCoverLetter 
          ? "Your job-specific resume and cover letter are ready for download."
          : "Your job-specific resume is ready for download.",
      });

      return data.resume;
    } catch (error) {
      console.error('Generation failed:', error);
      
      // Better error handling with specific messages
      let errorMessage = "Please try again with a different job description.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as any;
        if (err.message?.includes('Invalid input')) {
          errorMessage = "Invalid input provided. Please check your contact information and try again.";
        } else if (err.message?.includes('Rate limit')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (err.message?.includes('authentication')) {
          errorMessage = "Session expired. Please sign in again.";
        }
      }
      
      toast({
        title: "Generation failed",
        description: errorMessage,
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