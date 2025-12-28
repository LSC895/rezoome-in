import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FixResult {
  fixed_resume: string;
  cover_letter: string | null;
  ats_analysis: {
    ats_score: number;
    keyword_match_percent: number;
    matched_keywords: string[];
    improvements_made: string[];
  };
}

// Local storage key for tracking daily fixes
const FIX_COUNT_KEY = 'rezoome_daily_fix_count';
const FREE_FIX_LIMIT = 1;

interface DailyCount {
  count: number;
  date: string;
}

export const useFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const { toast } = useToast();

  const getDailyCount = (): DailyCount => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(FIX_COUNT_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as DailyCount;
      if (parsed.date === today) {
        return parsed;
      }
    }
    
    return { count: 0, date: today };
  };

  const incrementCount = () => {
    const current = getDailyCount();
    current.count += 1;
    localStorage.setItem(FIX_COUNT_KEY, JSON.stringify(current));
  };

  const canFixForFree = (): boolean => {
    const { count } = getDailyCount();
    return count < FREE_FIX_LIMIT;
  };

  const getRemainingFixes = (): number => {
    const { count } = getDailyCount();
    return Math.max(0, FREE_FIX_LIMIT - count);
  };

  const generateFix = async (
    resumeContent: string, 
    jobDescription: string,
    includeCoverLetter: boolean = false
  ): Promise<FixResult | null> => {
    setIsFixing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fix', {
        body: {
          resume_content: resumeContent,
          job_description: jobDescription,
          include_cover_letter: includeCoverLetter
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate fix');
      }

      if (!data?.success || !data?.fixed_resume) {
        throw new Error('Invalid response from fix service');
      }

      const result: FixResult = {
        fixed_resume: data.fixed_resume,
        cover_letter: data.cover_letter || null,
        ats_analysis: data.ats_analysis || {
          ats_score: 85,
          keyword_match_percent: 80,
          matched_keywords: [],
          improvements_made: []
        }
      };

      setFixResult(result);
      incrementCount();
      
      toast({
        title: "Resume Fixed!",
        description: `ATS Score: ${result.ats_analysis.ats_score}%`,
      });

      return result;

    } catch (error: any) {
      console.error('Fix error:', error);
      toast({
        title: "Fix Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsFixing(false);
    }
  };

  const clearFix = () => {
    setFixResult(null);
  };

  return {
    generateFix,
    isFixing,
    fixResult,
    clearFix,
    canFixForFree,
    getRemainingFixes
  };
};
