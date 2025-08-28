
import React, { useState } from 'react';
import { Upload, RefreshCw, Twitter, Wand2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResumeGenerator from '@/components/ResumeGenerator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { Link } from 'react-router-dom';

const Index = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { sessionId, isLoading: sessionLoading } = useSession();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setCurrentStep('generator');
  };

  const handleTryAgain = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
  };

  if (currentStep === 'generator' && uploadedFile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <ResumeGenerator onBack={handleTryAgain} uploadedFile={uploadedFile} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Rezoome
            </div>
            <div className="flex items-center gap-4">
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="text-sm">
                  Pricing
                </Button>
              </Link>
              <Button size="sm" className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Sign in
              </Button>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                One resume
              </span>
              <br />
              <span className="text-foreground">for every job!</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload your master resume and generate tailored versions for any job application.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-lg mx-auto">
            {sessionLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
            )}
          </div>

          {/* Single Feature */}
          <div className="max-w-md mx-auto pt-16">
            <div className="group text-center space-y-4 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-purple-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Wand2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Smart Tailoring</h3>
              <p className="text-muted-foreground leading-relaxed">Automatically customize your resume for any job description</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                How it works
              </h2>
              <p className="text-muted-foreground text-lg">Simple process, powerful results</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  1
                </div>
                <h3 className="font-semibold text-foreground text-lg">Upload</h3>
                <p className="text-muted-foreground leading-relaxed">Upload your master resume</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  2
                </div>
                <h3 className="font-semibold text-foreground text-lg">Paste Job</h3>
                <p className="text-muted-foreground leading-relaxed">Paste any job description</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-green-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold shadow-lg">
                  3
                </div>
                <h3 className="font-semibold text-foreground text-lg">Download</h3>
                <p className="text-muted-foreground leading-relaxed">Get your tailored resume</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-12 bg-background/80">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2024 Rezoome. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
