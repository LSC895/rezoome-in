import React, { useState, useCallback } from 'react';
import { Flame, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import RoastResultDisplay from '@/components/RoastResultDisplay';
import FixedResume from '@/components/FixedResume';
import PaywallModal from '@/components/PaywallModal';
import { useRoast } from '@/hooks/useRoast';
import { useFix } from '@/hooks/useFix';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Step = 'upload' | 'roast' | 'fix';
type RoastType = 'friendly' | 'hr' | 'senior' | 'dark';
type Language = 'english' | 'hinglish';

const ROAST_TYPES = {
  friendly: { emoji: '😊', label: 'Friendly', desc: 'Gentle but honest' },
  hr: { emoji: '👔', label: 'HR Mode', desc: 'Professional recruiter POV' },
  senior: { emoji: '🧠', label: 'Senior Dev', desc: 'Brutally honest tech review' },
  dark: { emoji: '☠️', label: 'Dark Roast', desc: 'No mercy. You asked for it.' },
};

const LOADING_MESSAGES = [
  "Roasting your resume like a Sunday BBQ... 🔥",
  "Finding all the reasons recruiters ignore you... 👀",
  "Channeling inner HR energy... 👔",
  "Preparing brutal truths... 💀",
  "This might hurt a little... 😬",
  "Scanning for cringe moments... 🫣",
  "Calculating rejection probability... 📉",
];

const Roast = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [roastType, setRoastType] = useState<RoastType>('senior');
  const [language, setLanguage] = useState<Language>('english');
  const [showPaywall, setShowPaywall] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const { toast } = useToast();
  
  const { roastResume, isRoasting, roastResult, clearRoast } = useRoast();
  const { generateFix, isFixing, fixResult, clearFix, canFixForFree } = useFix();

  // Rotate loading messages
  React.useEffect(() => {
    if (isRoasting || isFixing) {
      const interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isRoasting, isFixing]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        
        if (file.type === 'application/pdf') {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      const textContent = file.type === 'application/pdf' 
        ? `[PDF File: ${file.name}]\n${content}` 
        : content;
      
      setResumeContent(textContent);
      toast({ title: "Resume uploaded! 📄", description: "Now paste that job description" });
    } catch (error) {
      toast({ title: "Upload failed 😢", description: "Try again", variant: "destructive" });
    }
  }, [toast]);

  const handleRoast = async () => {
    if (!resumeContent) {
      toast({ title: "Upload your resume first! 📄", variant: "destructive" });
      return;
    }
    if (!jobDescription || jobDescription.length < 50) {
      toast({ title: "Paste a job description", description: "At least 50 characters bro", variant: "destructive" });
      return;
    }

    const result = await roastResume(resumeContent, jobDescription, roastType, language);
    if (result) {
      setCurrentStep('roast');
    }
  };

  const handleGetFix = () => {
    if (canFixForFree()) {
      generateFixNow();
    } else {
      setShowPaywall(true);
    }
  };

  const generateFixNow = async () => {
    setShowPaywall(false);
    const result = await generateFix(resumeContent, jobDescription, true);
    if (result) {
      setCurrentStep('fix');
    }
  };

  const handleTryAgain = () => {
    setCurrentStep('upload');
    setResumeContent('');
    setJobDescription('');
    clearRoast();
    clearFix();
  };

  const handleBackToRoast = () => {
    setCurrentStep('roast');
    clearFix();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold fire-text flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              Rezoome
            </Link>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Why we roast? 🤔
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Loading State */}
        {(isRoasting || isFixing) && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in-up">
            <div className="relative">
              <div className="w-24 h-24 rounded-full fire-gradient animate-pulse-fire flex items-center justify-center">
                <Flame className="h-12 w-12 text-primary-foreground animate-bounce-subtle" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{loadingMessage}</h2>
              <p className="text-muted-foreground">
                {isRoasting ? "Hang tight, truth incoming..." : "Cooking up fixes..."}
              </p>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upload Step */}
        {currentStep === 'upload' && !isRoasting && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Hero */}
            <div className="text-center space-y-4 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Before you apply,{' '}
                <span className="fire-text">get roasted 🔥</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Find out why recruiters are ghosting you. Brutal honesty, zero BS.
              </p>
            </div>

            {/* Main Form Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Step 1: Upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 fire-gradient text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <h2 className="font-semibold">Drop your resume</h2>
                </div>
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  isLoading={false}
                />
                {resumeContent && (
                  <p className="text-sm text-success mt-2 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" /> Resume uploaded!
                  </p>
                )}
              </div>

              {/* Step 2: Roast Settings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 fire-gradient text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <h2 className="font-semibold">Pick your roast level</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={roastType} onValueChange={(v) => setRoastType(v as RoastType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Roast type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROAST_TYPES).map(([key, { emoji, label, desc }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <div>
                              <span className="font-medium">{label}</span>
                              <span className="text-xs text-muted-foreground ml-1">- {desc}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">🇬🇧 English</SelectItem>
                      <SelectItem value="hinglish">🇮🇳 Hinglish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {roastType === 'dark' && (
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ Warning: Dark roast = harsh language. No crying allowed.
                  </p>
                )}
              </div>

              {/* Step 3: Job Description */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 fire-gradient text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <h2 className="font-semibold">Paste the job description</h2>
                </div>
                <Textarea
                  placeholder="Paste the full JD here... the more details, the better roast 🎯"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[150px] resize-none bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {jobDescription.length < 50 
                    ? `Need ${50 - jobDescription.length} more characters` 
                    : '✓ Looking good!'}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleRoast}
                disabled={!resumeContent || jobDescription.length < 50 || isRoasting}
                size="lg"
                className="w-full fire-gradient text-primary-foreground font-bold py-6 text-lg btn-glow transition-all hover:scale-[1.02]"
              >
                <Flame className="h-5 w-5 mr-2" />
                Roast It 🔥
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Free roast • No signup • Results in 10 seconds
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['Shortlist %', 'Rejection reasons', 'Section roasts', 'ATS score', 'Fix suggestions'].map((feature) => (
                <span 
                  key={feature}
                  className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roast Result Step */}
        {currentStep === 'roast' && roastResult && !isRoasting && (
          <div className="space-y-6 animate-fade-in-up">
            <Button variant="ghost" onClick={handleTryAgain} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try another
            </Button>
            <RoastResultDisplay 
              roast={roastResult} 
              onGetFix={handleGetFix}
              onTryAgain={handleTryAgain}
            />
          </div>
        )}

        {/* Fixed Resume Step */}
        {currentStep === 'fix' && fixResult && !isFixing && (
          <div className="space-y-6 animate-fade-in-up">
            <Button variant="ghost" onClick={handleBackToRoast} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to roast
            </Button>
            <FixedResume 
              result={fixResult}
              onBack={handleTryAgain}
            />
          </div>
        )}
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onGetFix={generateFixNow}
        isLoading={isFixing}
        canGetFreefix={canFixForFree()}
      />

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Made with 🔥 by Rezoome</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground fun-underline">Privacy</a>
              <a href="#" className="hover:text-foreground fun-underline">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Roast;