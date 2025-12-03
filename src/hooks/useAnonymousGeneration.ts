import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DAILY_LIMIT_KEY = 'rezoome_daily_generations';
const FREE_DAILY_LIMIT = 1;

interface GenerationCount {
  date: string;
  count: number;
}

interface GeneratedResume {
  content: string;
  cover_letter?: string;
  ats_score: number;
  template: string;
}

export const useAnonymousGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const { toast } = useToast();

  const getDailyGenerationCount = (): GenerationCount => {
    const stored = localStorage.getItem(DAILY_LIMIT_KEY);
    if (!stored) {
      return { date: new Date().toDateString(), count: 0 };
    }
    const parsed = JSON.parse(stored);
    // Reset if it's a new day
    if (parsed.date !== new Date().toDateString()) {
      return { date: new Date().toDateString(), count: 0 };
    }
    return parsed;
  };

  const incrementDailyCount = () => {
    const current = getDailyGenerationCount();
    const updated = {
      date: new Date().toDateString(),
      count: current.count + 1
    };
    localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(updated));
  };

  const canGenerateAnonymously = (): boolean => {
    const { count } = getDailyGenerationCount();
    return count < FREE_DAILY_LIMIT;
  };

  const getRemainingGenerations = (): number => {
    const { count } = getDailyGenerationCount();
    return Math.max(0, FREE_DAILY_LIMIT - count);
  };

  const generateResumeAnonymous = async (
    masterCVData: any,
    jobDescription: string,
    template: string = 'modern',
    includeCoverLetter: boolean = false
  ): Promise<GeneratedResume | null> => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-preview', {
        body: {
          master_cv_data: masterCVData,
          job_description: jobDescription,
          template: template,
          include_cover_letter: includeCoverLetter
        }
      });

      if (error) throw error;

      incrementDailyCount();
      setGeneratedResume(data.resume);

      toast({
        title: includeCoverLetter ? "Resume & Cover Letter generated! ✨" : "Resume generated! ✨",
        description: "Sign in to download your tailored resume.",
      });

      return data.resume;
    } catch (error) {
      console.error('Generation failed:', error);
      
      let errorMessage = "Please try again with a different job description.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as any;
        if (err.message?.includes('Rate limit')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateResumeAnonymous,
    isGenerating,
    generatedResume,
    setGeneratedResume,
    canGenerateAnonymously,
    getRemainingGenerations
  };
};
