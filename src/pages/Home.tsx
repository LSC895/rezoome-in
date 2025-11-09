import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Twitter, ArrowLeft, Loader2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResumeGenerator from '@/components/ResumeGenerator';
import MasterCVEditor from '@/components/MasterCVEditor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from '@clerk/clerk-react';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useMasterCV } from '@/hooks/useMasterCV';

const Home = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'generator'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useHybridAuth();
  const { parseResume, saveMasterCV, loadMasterCV, isParsing, isLoading, masterCVData } = useMasterCV();

  // Check if user already has a master CV on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadMasterCV();
    }
  }, [isAuthenticated]);

  // Show loading state while syncing auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-muted-foreground">Connecting your account...</p>
        </div>
      </div>
    );
  }

  // Show error if auth sync failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Authentication Error: {authError}</p>
          <p className="text-sm text-muted-foreground">Please try signing out and back in.</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    
    try {
      // Read file content
      const text = await file.text();
      
      // Parse with AI
      const data = await parseResume(text, file.name);
      setParsedData(data);
      setCurrentStep('review');
    } catch (error) {
      console.error('File processing failed:', error);
      setUploadedFile(null);
    }
  };

  const handleSaveMasterCV = async (data: any) => {
    try {
      await saveMasterCV(data);
      setCurrentStep('generator');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancelReview = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData(null);
  };

  const handleTryAgain = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setParsedData(null);
  };

  const handleStartGeneration = () => {
    if (masterCVData) {
      setCurrentStep('generator');
    } else {
      toast({
        title: "No master CV found",
        description: "Please upload and review your resume first.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {isParsing && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
              <p className="text-lg font-medium">Parsing your resume with AI...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        )}

        {!isParsing && currentStep === 'review' && parsedData && (
          <div className="min-h-screen bg-white">
            <div className="container mx-auto px-6 py-16 max-w-5xl">
              <MasterCVEditor 
                initialData={parsedData}
                onSave={handleSaveMasterCV}
                onCancel={handleCancelReview}
                isSaving={isLoading}
              />
            </div>
          </div>
        )}

        {!isParsing && currentStep === 'generator' && uploadedFile && (
          <div className="min-h-screen bg-white">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
              <ResumeGenerator onBack={handleTryAgain} uploadedFile={uploadedFile} />
            </div>
          </div>
        )}

        {!isParsing && currentStep === 'upload' && (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/')}
                      className="text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Rezoome
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link to="/pricing">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Pricing
                      </Button>
                    </Link>
                    <UserButton />
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-20">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                
                {/* Main Headline */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Create your perfect
                    </span>
                    <br />
                    <span className="text-gray-900">resume now!</span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {masterCVData 
                      ? 'Generate tailored resumes for any job application using your master CV.'
                      : 'Upload your master resume and AI will extract all your information for easy customization.'
                    }
                  </p>
                </div>

                {/* Show different UI based on whether master CV exists */}
                {masterCVData ? (
                  <div className="max-w-lg mx-auto space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <p className="text-green-800 font-medium mb-2">✓ Master CV Ready</p>
                      <p className="text-sm text-green-700 mb-4">
                        Your information is saved and ready to use
                      </p>
                      <Button 
                        onClick={handleStartGeneration}
                        size="lg"
                        className="w-full"
                      >
                        Generate Tailored Resume
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('upload')}
                      className="w-full"
                    >
                      Upload New Resume
                    </Button>
                  </div>
                ) : (
                  <div className="max-w-lg mx-auto">
                    <FileUpload onFileSelect={handleFileSelect} isLoading={isParsing} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SignedIn>
    </>
  );
};

export default Home;