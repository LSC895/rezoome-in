
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Trophy, TrendingUp, AlertTriangle, CheckCircle, Wand2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface Section {
  name: string;
  score: number;
  feedback: string;
}

interface RoastResultProps {
  roast: string;
  atsScore: number;
  sections: Section[];
  onTryAgain: () => void;
  onGenerateResume?: () => void;
  originalResumeContent?: string;
}

const RoastResult: React.FC<RoastResultProps> = ({ 
  roast, 
  atsScore, 
  sections, 
  onTryAgain,
  onGenerateResume,
  originalResumeContent
}) => {
  const [currentPersonality, setCurrentPersonality] = useState<'professional' | 'memer' | 'motivational' | 'hr'>('professional');
  
  // Store original resume content in localStorage for the generator
  useEffect(() => {
    if (originalResumeContent) {
      localStorage.setItem('originalResumeContent', originalResumeContent);
    }
  }, [originalResumeContent]);

  // Trigger confetti for high scores
  useEffect(() => {
    if (atsScore >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [atsScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const handleDownloadReport = () => {
    const reportContent = `
RESUME ANALYSIS REPORT
======================

ATS Score: ${atsScore}/100

Overall Feedback:
${roast}

Section Breakdown:
${sections.map(section => `
${section.name}: ${section.score}/100
${section.feedback}
`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const roastPersonalities = {
    professional: "Your resume shows solid potential with room for strategic improvements. Focus on optimizing keyword placement and quantifying achievements to better communicate your value to both ATS systems and hiring managers.",
    memer: "Your resume has main character energy, but it needs some tweaks to really shine! Time to level up those keywords and make your achievements pop like they deserve to. You've got this! 💪",
    motivational: "Every successful professional started somewhere, and your resume shows great foundation! With some focused improvements on keywords and metrics, you're going to absolutely crush those job applications! 🌟",
    hr: "From a hiring perspective, this resume demonstrates good experience but would benefit from better keyword optimization and more quantifiable achievements to improve screening compatibility."
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm" 
          onClick={onTryAgain}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Try Another Resume
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Main Results */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ATS Score */}
        <div className="floating-card p-8 text-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-sora font-bold text-2xl text-foreground">ATS Score</h2>
              <p className="text-muted-foreground">How well your resume performs with hiring systems</p>
            </div>
            
            <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-2xl border-2 ${getScoreColor(atsScore)}`}>
              {getScoreIcon(atsScore)}
              <span className="font-sora font-bold text-4xl">{atsScore}/100</span>
            </div>

            {atsScore >= 80 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">Excellent Resume!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resume Feedback */}
        <div className="floating-card p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sora font-bold text-2xl text-foreground">Feedback</h2>
              
              {/* Personality Selector */}
              <div className="flex space-x-2">
                {(['professional', 'memer', 'motivational', 'hr'] as const).map((personality) => (
                  <Button
                    key={personality}
                    variant={currentPersonality === personality ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPersonality(personality)}
                    className="capitalize text-xs"
                  >
                    {personality === 'memer' ? 'casual' : personality}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-2xl p-6">
              <p className="text-foreground leading-relaxed">
                {roastPersonalities[currentPersonality]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="floating-card p-8">
        <div className="space-y-6">
          <h2 className="font-sora font-bold text-2xl text-foreground text-center">
            Section-by-Section Analysis
          </h2>
          
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sora font-semibold text-lg text-foreground">
                    {section.name}
                  </h3>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getScoreColor(section.score)}`}>
                    {getScoreIcon(section.score)}
                    <span className="font-bold">{section.score}/100</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {section.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Resume CTA */}
      {onGenerateResume && (
        <div className="floating-card p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-sora font-bold text-2xl text-foreground">
                Ready for the Next Step?
              </h2>
              <p className="text-muted-foreground text-lg">
                Now that you know what to improve, let's create job-specific resumes that get you hired
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={onGenerateResume}
                size="lg"
                className="gradient-purple text-white font-sora font-bold text-lg py-4 px-8 rounded-2xl hover:opacity-90 transition-opacity"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Job-Specific Resume
              </Button>
              
              <Button
                onClick={onTryAgain}
                variant="outline"
                size="lg"
                className="font-sora font-bold text-lg py-4 px-8 rounded-2xl"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Another Resume
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">Tailored for each job</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">ATS optimized</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">PDF & DOCX ready</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoastResult;
