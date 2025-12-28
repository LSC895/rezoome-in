import React, { useState } from 'react';
import { Copy, Download, Check, FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { FixResult } from '@/hooks/useFix';

interface FixedResumeProps {
  result: FixResult;
  onBack: () => void;
}

const FixedResume: React.FC<FixedResumeProps> = ({ result, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.fixed_resume);
      setCopied(true);
      toast({ title: "Copied!", description: "Resume copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleDownloadTXT = () => {
    const blob = new Blob([result.fixed_resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-fixed-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Resume saved as TXT" });
  };

  const handleCopyCoverLetter = async () => {
    if (!result.cover_letter) return;
    try {
      await navigator.clipboard.writeText(result.cover_letter);
      toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
          <p className="text-3xl font-bold text-green-600">{result.ats_analysis.ats_score}%</p>
          <p className="text-sm text-muted-foreground">ATS Score</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center border border-blue-200">
          <p className="text-3xl font-bold text-blue-600">{result.ats_analysis.keyword_match_percent}%</p>
          <p className="text-sm text-muted-foreground">Keyword Match</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200">
          <p className="text-3xl font-bold text-purple-600">{result.ats_analysis.matched_keywords.length}</p>
          <p className="text-sm text-muted-foreground">Keywords Added</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border border-orange-200">
          <p className="text-3xl font-bold text-orange-600">{result.ats_analysis.improvements_made.length}</p>
          <p className="text-sm text-muted-foreground">Improvements</p>
        </div>
      </div>

      {/* Improvements Made */}
      {result.ats_analysis.improvements_made.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            What we improved:
          </h3>
          <ul className="space-y-1">
            {result.ats_analysis.improvements_made.slice(0, 5).map((improvement, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fixed Resume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Fixed Resume</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTXT}>
              <Download className="h-4 w-4 mr-1" />
              TXT
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-xl p-6 max-h-[500px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {result.fixed_resume}
          </pre>
        </div>
      </div>

      {/* Cover Letter (if available) */}
      {result.cover_letter && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCoverLetter(!showCoverLetter)}
            className="flex items-center gap-2 text-lg font-semibold hover:text-purple-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
            Cover Letter
            {showCoverLetter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showCoverLetter && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleCopyCoverLetter}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Cover Letter
                </Button>
              </div>
              <div className="bg-white border rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {result.cover_letter}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Roast Another Resume
        </Button>
      </div>
    </div>
  );
};

export default FixedResume;
