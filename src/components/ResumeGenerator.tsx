
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeGeneration } from '@/hooks/useResumeGeneration';
import { useSession } from '@/hooks/useSession';
import { EditableResume } from './EditableResume';
import ChromeExtensionPromo from './ChromeExtensionPromo';
import { supabase } from '@/integrations/supabase/client';

interface ResumeGeneratorProps {
  onBack: () => void;
  uploadedFile: File;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ onBack, uploadedFile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [editedResumeContent, setEditedResumeContent] = useState('');
  const { generateResume, isGenerating, generatedResume } = useResumeGeneration();
  const { sessionId } = useSession();

  // Store the uploaded file content for generation
  useEffect(() => {
    const parseAndStoreFile = async () => {
      try {
        const fileExtension = uploadedFile.name.toLowerCase().split('.').pop() || '';
        
        // For all file types, use the document parsing service
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await supabase.functions.invoke('parse-document', {
          body: formData
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Failed to parse document');
        }
        
        const { extractedText } = response.data;
        localStorage.setItem('originalResumeContent', extractedText);
        console.log(`Successfully parsed ${uploadedFile.name}: ${extractedText.length} characters`);
        
      } catch (error) {
        console.error('Failed to parse file:', error);
        // Fallback: create a basic template
        const fallbackContent = `Professional Resume (${uploadedFile.name})

Please note: Unable to parse the uploaded file automatically. This is a template that should be customized with your actual information.

PROFESSIONAL SUMMARY
[Your professional summary here]

WORK EXPERIENCE
[Your work experience here]

EDUCATION
[Your education here]

SKILLS
[Your skills here]`;
        localStorage.setItem('originalResumeContent', fallbackContent);
      }
    };

    parseAndStoreFile();
  }, [uploadedFile]);

  // Update edited content when new resume is generated
  useEffect(() => {
    if (generatedResume?.content) {
      setEditedResumeContent(generatedResume.content);
    }
  }, [generatedResume]);

  const handleGenerateResume = async () => {
    if (!jobDescription.trim() || !sessionId) return;
    
    try {
      await generateResume(jobDescription, sessionId);
    } catch (error) {
      console.error('Failed to generate resume:', error);
    }
  };

  const handleSaveResume = (content: string) => {
    setEditedResumeContent(content);
  };

  const handleDownloadPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([editedResumeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tailored-resume-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleDownloadDOCX = () => {
    const element = document.createElement('a');
    const file = new Blob([editedResumeContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tailored-resume-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Upload New Resume
        </Button>
      </div>

      <div className="text-center space-y-4">
        <h1 className="font-sora font-bold text-4xl text-foreground">
          Generate Job-Specific Resume
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste any job description and get a tailored resume specifically for that role
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm">
          <span className="font-medium">✓ Resume uploaded: {uploadedFile.name}</span>
        </div>
      </div>

      {/* Job Description Input */}
      <div className="floating-card p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="font-sora font-semibold text-lg text-foreground">
              Job Description
            </label>
            <p className="text-muted-foreground">
              Copy and paste the complete job posting, including requirements, responsibilities, and qualifications.
            </p>
          </div>

          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 3+ years of experience in React, Node.js, and cloud technologies. The ideal candidate will have experience with microservices architecture, API development, and agile methodologies..."
            className="w-full h-64 p-4 border border-border rounded-2xl text-foreground bg-background placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateResume}
              disabled={isGenerating || !jobDescription.trim() || !sessionId}
              size="lg"
              className="gradient-purple text-white font-sora font-bold text-xl py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="animate-spin mr-2 h-5 w-5" />
                  GENERATING RESUME...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  GENERATE TAILORED RESUME
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Resume Preview */}
      {generatedResume && (
        <div className="floating-card p-8 max-w-4xl mx-auto animate-scale-in">
          <EditableResume
            initialContent={editedResumeContent}
            onSave={handleSaveResume}
            onDownloadPDF={handleDownloadPDF}
            onDownloadDOCX={handleDownloadDOCX}
          />

          <div className="text-center space-y-4 mt-6">
            <p className="text-muted-foreground">
              This resume has been optimized with keywords from the job description and tailored to match the specific requirements.
            </p>
          </div>
        </div>
      )}

      {/* Chrome Extension Promotion */}
      <div className="floating-card p-8 max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <ChromeExtensionPromo />
      </div>
    </div>
  );
};

export default ResumeGenerator;
