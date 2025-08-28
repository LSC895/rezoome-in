
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResumeGeneration } from '@/hooks/useResumeGeneration';
import { useSession } from '@/hooks/useSession';

interface ResumeGeneratorProps {
  onBack: () => void;
  uploadedFile: File;
}

const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ onBack, uploadedFile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const { generateResume, isGenerating, generatedResume } = useResumeGeneration();
  const { sessionId } = useSession();

  // Store the uploaded file content for generation
  useEffect(() => {
    const readFileContent = async () => {
      try {
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(uploadedFile);
        });
        localStorage.setItem('originalResumeContent', fileContent);
      } catch (error) {
        console.error('Failed to read file content:', error);
      }
    };

    readFileContent();
  }, [uploadedFile]);

  const handleGenerateResume = async () => {
    if (!jobDescription.trim() || !sessionId) return;
    
    try {
      await generateResume(jobDescription, sessionId);
    } catch (error) {
      console.error('Failed to generate resume:', error);
    }
  };

  const handleDownloadPDF = () => {
    // In a real implementation, you'd convert markdown to PDF
    console.log('Download PDF functionality would be implemented here');
  };

  const handleDownloadDOCX = () => {
    // In a real implementation, you'd convert markdown to DOCX
    console.log('Download DOCX functionality would be implemented here');
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
        <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sora font-bold text-2xl text-foreground">
                Your Tailored Resume
              </h2>
              <div className="flex space-x-3">
                <Button
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="gradient-purple text-white hover:opacity-90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleDownloadDOCX}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download DOCX
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                {generatedResume.content}
              </pre>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This resume has been optimized with keywords from the job description and tailored to match the specific requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chrome Extension Promotion */}
      <div className="floating-card p-8 max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Copy className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-sora font-bold text-xl text-foreground">
            Get the Chrome Extension
          </h3>
          <p className="text-muted-foreground">
            Highlight any job posting on LinkedIn, Indeed, or company websites and generate a tailored resume instantly.
          </p>
          <Button 
            size="lg"
            className="gradient-purple text-white font-sora font-bold hover:opacity-90 transition-opacity"
          >
            Add to Chrome (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeGenerator;
