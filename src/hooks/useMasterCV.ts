import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MasterCVData {
  id?: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  professional_summary: string | null;
  work_experience: any;
  education: any;
  technical_skills: any;
  projects: any;
  certifications: any;
  achievements: any;
  original_filename: string | null;
  parse_status?: 'pending' | 'parsed' | 'reviewed' | 'active';
}

export const useMasterCV = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [masterCVData, setMasterCVData] = useState<MasterCVData | null>(null);
  const { toast } = useToast();

  const parseResume = async (resumeText: string, filename: string) => {
    setIsParsing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-master-cv', {
        body: { resumeText, filename }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setMasterCVData(data.data);
      
      toast({
        title: "Resume parsed successfully! ✨",
        description: "Review and edit your information below.",
      });

      return data.data;
    } catch (error) {
      console.error('Parse failed:', error);
      toast({
        title: "Failed to parse resume",
        description: error instanceof Error ? error.message : "Please try again with a different file.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsParsing(false);
    }
  };

  const loadMasterCV = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('master_cv_data')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      setMasterCVData(data as any);
      return data;
    } catch (error) {
      console.error('Load master CV failed:', error);
      toast({
        title: "Failed to load master CV",
        description: "Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveMasterCV = async (data: MasterCVData) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const payload: any = {
        ...data,
        user_id: user.id,
        parse_status: 'reviewed' as const,
        last_parsed_at: new Date().toISOString(),
      };

      const { data: savedData, error } = await supabase
        .from('master_cv_data')
        .upsert([payload])
        .select()
        .single();

      if (error) throw error;

      setMasterCVData(savedData as any);
      
      toast({
        title: "Master CV saved! ✓",
        description: "Your information has been securely stored.",
      });

      return savedData;
    } catch (error) {
      console.error('Save master CV failed:', error);
      toast({
        title: "Failed to save master CV",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMasterCV = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('master_cv_data')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setMasterCVData(null);
      
      toast({
        title: "Master CV deleted",
        description: "Your master CV has been removed.",
      });
    } catch (error) {
      console.error('Delete master CV failed:', error);
      toast({
        title: "Failed to delete master CV",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    parseResume,
    loadMasterCV,
    saveMasterCV,
    deleteMasterCV,
    isLoading,
    isParsing,
    masterCVData,
    setMasterCVData
  };
};
