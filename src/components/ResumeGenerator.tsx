import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, FileText, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeGeneration } from '@/hooks/useResumeGeneration';
import { useAnonymousGeneration } from '@/hooks/useAnonymousGeneration';
import { FormattedResume } from './FormattedResume';
import { AuthRequiredModal } from './AuthRequiredModal';
import ChromeExtensionPromo from './ChromeExtensionPromo';
import LoadingSkeleton from './LoadingSkeleton';
import TemplateSelector from './TemplateSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { useUser } from '@clerk/clerk-react';

interface ResumeGeneratorProps {
  onBack: () => void;
  uploadedFile: File;
  cvData?: any;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ onBack, uploadedFile, cvData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [editedResumeContent, setEditedResumeContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'creative'>('modern');
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [lastCallTime, setLastCallTime] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<'download' | 'copy' | 'generate_limit'>('download');
  const [copied, setCopied] = useState(false);
  
  const { user } = useUser();
  const isAuthenticated = !!user;
  
  // Use appropriate hook based on auth status
  const { generateResume, isGenerating: isGeneratingAuth, generatedResume: generatedResumeAuth } = useResumeGeneration();
  const { 
    generateResumeAnonymous, 
    isGenerating: isGeneratingAnon, 
    generatedResume: generatedResumeAnon,
    canGenerateAnonymously,
    getRemainingGenerations
  } = useAnonymousGeneration();
  
  const isGenerating = isAuthenticated ? isGeneratingAuth : isGeneratingAnon;
  const generatedResume = isAuthenticated ? generatedResumeAuth : generatedResumeAnon;
  
  const MIN_CALL_INTERVAL = 3000;

  // Update edited content when new resume is generated
  useEffect(() => {
    if (generatedResume?.content) {
      setEditedResumeContent(generatedResume.content);
      if (generatedResume.cover_letter) {
        setGeneratedCoverLetter(generatedResume.cover_letter);
      }
    }
  }, [generatedResume]);

  // Loading progress simulation
  useEffect(() => {
    if (isGenerating) {
      setLoadingProgress(0);
      setLoadingStatus('Analyzing job description...');
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 30) {
            setLoadingStatus('Extracting key requirements...');
            return prev + 2;
          } else if (prev < 60) {
            setLoadingStatus('Tailoring your resume with AI...');
            return prev + 1;
          } else if (prev < 85) {
            setLoadingStatus('Optimizing for ATS compatibility...');
            return prev + 0.5;
          } else if (prev < 95) {
            setLoadingStatus('Adding action-driven bullet points...');
            return prev + 0.2;
          }
          return prev;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) return;
    
    // Client-side rate limiting
    const now = Date.now();
    if (now - lastCallTime < MIN_CALL_INTERVAL) {
      toast.error('Please wait a few seconds before generating again');
      return;
    }
    
    // Check daily limit for anonymous users
    if (!isAuthenticated && !canGenerateAnonymously()) {
      setAuthModalAction('generate_limit');
      setAuthModalOpen(true);
      return;
    }
    
    setLastCallTime(now);
    
    try {
      if (isAuthenticated) {
        await generateResume(jobDescription, selectedTemplate, includeCoverLetter);
      } else {
        // Use anonymous generation with cvData
        await generateResumeAnonymous(cvData, jobDescription, selectedTemplate, includeCoverLetter);
      }
    } catch (error) {
      console.error('Failed to generate resume:', error);
    }
  };

  const handleSaveResume = (content: string) => {
    setEditedResumeContent(content);
    setIsEditingResume(false);
  };

  const handleCancelEdit = () => {
    setIsEditingResume(false);
  };

  const handleEditToggle = () => {
    setIsEditingResume(!isEditingResume);
  };

  const handleDownloadPDF = () => {
    if (!isAuthenticated) {
      setAuthModalAction('download');
      setAuthModalOpen(true);
      return;
    }
    
    try {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(editedResumeContent || generatedResume?.content || '', 180);
      doc.text(lines, 15, 15);
      const filename = `tailored-resume-${selectedTemplate}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleDownloadDOCX = () => {
    if (!isAuthenticated) {
      setAuthModalAction('download');
      setAuthModalOpen(true);
      return;
    }
    
    const blob = new Blob([editedResumeContent || generatedResume?.content || ''], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored-resume-${selectedTemplate}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  const handleCopyResume = () => {
    if (!isAuthenticated) {
      setAuthModalAction('copy');
      setAuthModalOpen(true);
      return;
    }
    
    navigator.clipboard.writeText(editedResumeContent || generatedResume?.content || '');
    setCopied(true);
    toast.success('Resume copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCoverLetter = () => {
    if (!isAuthenticated) {
      setAuthModalAction('download');
      setAuthModalOpen(true);
      return;
    }
    
    if (!generatedCoverLetter) return;
    const blob = new Blob([generatedCoverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Cover letter downloaded!');
  };

  return (
    <div className="space-y-8">
      {/* Auth Modal */}
      <AuthRequiredModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authModalAction}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Upload New Resume
        </Button>
        
        {!isAuthenticated && (
          <div className="text-sm text-muted-foreground">
            {getRemainingGenerations() > 0 
              ? `${getRemainingGenerations()} free generation left today`
              : 'Daily limit reached - Sign in for more'
            }
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <h1 className="font-sora font-bold text-4xl text-foreground">
          Generate Job-Specific Resume
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste any job description and get an ATS-optimized resume tailored for that role
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm">
          <span className="font-medium">✓ Resume uploaded: {uploadedFile.name}</span>
        </div>
      </div>

      {/* Template Selection */}
      <div className="floating-card p-8 max-w-4xl mx-auto">
        <TemplateSelector 
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />
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

          {/* Cover Letter Option */}
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl">
            <input
              type="checkbox"
              id="includeCoverLetter"
              checked={includeCoverLetter}
              onChange={(e) => setIncludeCoverLetter(e.target.checked)}
              className="rounded border-border"
            />
            <div>
              <label htmlFor="includeCoverLetter" className="font-medium text-foreground cursor-pointer flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Generate matching cover letter
              </label>
              <p className="text-sm text-muted-foreground">
                Create a personalized cover letter that complements your tailored resume
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateResume}
              disabled={isGenerating || !jobDescription.trim()}
              size="lg"
              className="gradient-purple text-white font-sora font-bold text-xl py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="animate-spin mr-2 h-5 w-5" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  GENERATE {includeCoverLetter ? 'RESUME & COVER LETTER' : 'TAILORED RESUME'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <LoadingSkeleton progress={loadingProgress} status={loadingStatus} />
      )}

      {/* Generated Resume Preview */}
      {generatedResume && !isGenerating && (
        <div className="space-y-6">
          {/* ATS Score Display */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-green-800 dark:text-green-200">ATS Compatibility Score</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Your resume is optimized for applicant tracking systems</p>
                </div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {generatedResume.ats_score}%
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto animate-scale-in">
            <FormattedResume
              content={editedResumeContent}
              template={selectedTemplate}
              isEditing={isEditingResume}
              onEditToggle={handleEditToggle}
              onSave={handleSaveResume}
              onCancel={handleCancelEdit}
              onDownloadPDF={handleDownloadPDF}
              onDownloadDOCX={handleDownloadDOCX}
              onCopy={handleCopyResume}
              isAuthenticated={isAuthenticated}
            />

            {!isEditingResume && (
              <div className="text-center space-y-4 mt-6">
                <p className="text-muted-foreground">
                  This resume has been ATS-optimized with keywords from the job description and tailored to match the specific requirements.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-purple-600 font-medium">
                    ✨ Sign in free to download your optimized resume
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cover Letter Preview */}
          {generatedCoverLetter && (
            <div className="floating-card p-8 max-w-4xl mx-auto animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sora font-bold text-2xl text-foreground flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  Your Cover Letter
                </h3>
                <Button
                  onClick={handleDownloadCoverLetter}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isAuthenticated ? 'Download' : 'Sign in to Download'}
                </Button>
              </div>
              
              <div className="bg-background border border-border rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                  {generatedCoverLetter}
                </pre>
              </div>
            </div>
          )}
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
