
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  id: string;
  ats_score: number;
  overall_feedback: string;
  sections: Array<{
    name: string;
    score: number;
    feedback: string;
  }>;
  originalContent?: string;
}

export const useResumeAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeResume = async (file: File, sessionId: string) => {
    setIsAnalyzing(true);
    
    try {
      // Convert file to base64 for API
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: {
          file_content: fileContent,
          file_name: file.name,
          file_size: file.size,
          session_id: sessionId
        }
      });

      if (error) throw error;

      const resultWithContent = {
        ...data.analysis,
        originalContent: fileContent
      };

      setAnalysisResult(resultWithContent);
      
      toast({
        title: "Resume analyzed! 🔥",
        description: "Your resume has been thoroughly analyzed.",
      });

      return resultWithContent;
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again or check your file format.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeResume,
    isAnalyzing,
    analysisResult,
    setAnalysisResult
  };
};
