import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoastSection {
  score: number;
  roast: string;
  severity?: 'brutal' | 'harsh' | 'mild';
  missing_skills?: string[];
  weak_bullets?: string[];
  issues?: string[];
}

export interface RoastResult {
  shortlist_probability: number;
  verdict: 'APPLY' | "DON'T APPLY" | 'MAYBE';
  verdict_reason: string;
  top_3_rejection_reasons: string[];
  ats_score: number;
  keyword_match_percent: number;
  keyword_gaps: string[];
  sections: {
    summary: RoastSection;
    skills: RoastSection;
    experience: RoastSection;
    projects: RoastSection;
    formatting: RoastSection;
  };
  jd_mismatch: {
    missing_requirements: string[];
    irrelevant_content: string[];
  };
  overall_roast: string;
}

export type RoastType = 'friendly' | 'hr' | 'senior' | 'dark';
export type Language = 'english' | 'hinglish';

export const useRoast = () => {
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const { toast } = useToast();

  const roastResume = async (
    resumeContent: string, 
    jobDescription: string,
    roastType: RoastType = 'senior',
    language: Language = 'english'
  ): Promise<RoastResult | null> => {
    setIsRoasting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('roast-resume', {
        body: {
          resume_content: resumeContent,
          job_description: jobDescription,
          roast_type: roastType,
          language: language
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to roast resume');
      }

      if (!data?.success || !data?.roast) {
        throw new Error('Invalid response from roast service');
      }

      setRoastResult(data.roast);
      return data.roast;

    } catch (error: any) {
      console.error('Roast error:', error);
      toast({
        title: "Roast Failed 😢",
        description: error.message || "Something went wrong. Try again!",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsRoasting(false);
    }
  };

  const clearRoast = () => {
    setRoastResult(null);
  };

  return {
    roastResume,
    isRoasting,
    roastResult,
    clearRoast
  };
};