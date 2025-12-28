import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, FileText, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeGeneration } from '@/hooks/useResumeGeneration';
import { useAnonymousGeneration } from '@/hooks/useAnonymousGeneration';
import { FormattedResume } from './FormattedResume';
import { ATSAnalysis } from './ATSAnalysis';
import { AuthRequiredModal } from './AuthRequiredModal';
import ChromeExtensionPromo from './ChromeExtensionPromo';
import LoadingSkeleton from './LoadingSkeleton';
import TemplateSelector from './TemplateSelector';
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
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  
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
      if ((generatedResume as any).ats_analysis) {
        setAtsAnalysis((generatedResume as any).ats_analysis);
      }
    }
  }, [generatedResume]);

  // Loading progress simulation - faster for better UX
  useEffect(() => {
    if (isGenerating) {
      setLoadingProgress(0);
      setLoadingStatus('Analyzing job description...');
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 25) {
            setLoadingStatus('Extracting key requirements...');
            return prev + 3;
          } else if (prev < 50) {
            setLoadingStatus('Matching skills to job description...');
            return prev + 2;
          } else if (prev < 75) {
            setLoadingStatus('Generating ATS-optimized resume...');
            return prev + 1.5;
          } else if (prev < 90) {
            setLoadingStatus('Adding action-driven bullet points...');
            return prev + 0.5;
          }
          return prev;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description first');
      return;
    }
    
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
    setAtsAnalysis(null);
    
    try {
      if (isAuthenticated) {
        await generateResume(jobDescription, selectedTemplate, includeCoverLetter);
      } else {
        // Use anonymous generation with cvData
        await generateResumeAnonymous(cvData, jobDescription, selectedTemplate, includeCoverLetter);
      }
    } catch (error) {
      console.error('Failed to generate resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    }
  };

  const handleSaveResume = (content: string) => {
    setEditedResumeContent(content);
    setIsEditingResume(false);
    toast.success('Resume saved!');
  };

  const handleCancelEdit = () => {
    setIsEditingResume(false);
  };

  const handleEditToggle = () => {
    setIsEditingResume(!isEditingResume);
  };

  // Improved PDF generation with better formatting
  const handleDownloadPDF = () => {
    if (!isAuthenticated) {
      setAuthModalAction('download');
      setAuthModalOpen(true);
      return;
    }
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const content = editedResumeContent || generatedResume?.content || '';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      
      // Set default font
      doc.setFont('helvetica');
      
      let y = margin;
      const lineHeight = 5;
      
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check if we need a new page
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        
        // Section headers (ALL CAPS)
        if (/^[A-Z\s]{3,}$/.test(trimmedLine) && trimmedLine.length > 3) {
          y += 3; // Add space before header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(trimmedLine, margin, y);
          y += lineHeight + 2;
          
          // Draw underline
          doc.setDrawColor(100, 100, 100);
          doc.line(margin, y - 3, pageWidth - margin, y - 3);
          continue;
        }
        
        // Name (first line, usually largest)
        if (y === margin && trimmedLine && !trimmedLine.startsWith('•')) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(trimmedLine, margin, y);
          y += lineHeight + 4;
          continue;
        }
        
        // Contact info line (contains | separator)
        if (trimmedLine.includes(' | ') && y < margin + 20) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(trimmedLine, margin, y);
          y += lineHeight;
          continue;
        }
        
        // Bullet points
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const bulletText = trimmedLine.substring(1).trim();
          const splitText = doc.splitTextToSize(`• ${bulletText}`, maxWidth - 5);
          doc.text(splitText, margin + 3, y);
          y += splitText.length * lineHeight;
          continue;
        }
        
        // Job titles or company names (contains — or |)
        if ((trimmedLine.includes(' — ') || trimmedLine.includes(' | ')) && !trimmedLine.startsWith('•')) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const splitText = doc.splitTextToSize(trimmedLine, maxWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * lineHeight + 1;
          continue;
        }
        
        // Empty lines
        if (!trimmedLine) {
          y += 2;
          continue;
        }
        
        // Regular text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(trimmedLine, maxWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * lineHeight;
      }
      
      const filename = `tailored-resume-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadTXT = () => {
    if (!isAuthenticated) {
      setAuthModalAction('download');
      setAuthModalOpen(true);
      return;
    }
    
    const content = editedResumeContent || generatedResume?.content || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tailored-resume-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded as TXT!');
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
    const blob = new Blob([generatedCoverLetter], { type: 'text/plain;charset=utf-8' });
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
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            {getRemainingGenerations() > 0 
              ? `${getRemainingGenerations()} free generation left today`
              : '🔒 Daily limit reached - Sign in for more'
            }
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <h1 className="font-sora font-bold text-4xl text-foreground">
          Generate Job-Specific Resume
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste any job description and get an ATS-optimized resume in seconds
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
              Copy and paste the complete job posting, including requirements and qualifications.
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
              className="rounded border-border h-5 w-5"
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
              className="gradient-purple text-white font-sora font-bold text-xl py-6 px-10 rounded-2xl hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="animate-spin mr-2 h-6 w-6" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-6 w-6" />
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
          {/* ATS Analysis Section */}
          <div className="max-w-4xl mx-auto">
            <ATSAnalysis 
              atsScore={generatedResume.ats_score} 
              atsAnalysis={atsAnalysis}
            />
          </div>

          {/* Resume Preview */}
          <div className="max-w-5xl mx-auto animate-scale-in">
            <FormattedResume
              content={editedResumeContent}
              template={selectedTemplate}
              isEditing={isEditingResume}
              onEditToggle={handleEditToggle}
              onSave={handleSaveResume}
              onCancel={handleCancelEdit}
              onDownloadPDF={handleDownloadPDF}
              onDownloadTXT={handleDownloadTXT}
              onCopy={handleCopyResume}
              isAuthenticated={isAuthenticated}
            />

            {!isEditingResume && (
              <div className="text-center space-y-4 mt-6">
                <p className="text-muted-foreground">
                  This resume has been ATS-optimized with keywords from the job description.
                </p>
                {!isAuthenticated && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    ✨ Sign in free to download your optimized resume as PDF
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
