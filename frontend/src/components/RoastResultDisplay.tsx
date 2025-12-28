import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Target, 
  Zap,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  TrendingDown,
  FileText,
  Layers,
  CheckCircle,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RoastResult as RoastResultType } from '@/hooks/useRoast';

interface RoastResultProps {
  roast: RoastResultType;
  onGetFix: () => void;
  onTryAgain: () => void;
}

const RoastResultDisplay: React.FC<RoastResultProps> = ({ roast, onGetFix, onTryAgain }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'APPLY': return { bg: 'bg-success', text: 'Go for it! 🚀', emoji: '✅' };
      case "DON'T APPLY": return { bg: 'bg-destructive', text: "Don't waste your time 💀", emoji: '❌' };
      default: return { bg: 'bg-warning', text: 'High risk... 😬', emoji: '⚠️' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-success/10';
    if (score >= 50) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const sectionMeta: Record<string, { icon: React.ReactNode; label: string }> = {
    summary: { icon: <FileText className="h-4 w-4" />, label: 'Summary' },
    skills: { icon: <Layers className="h-4 w-4" />, label: 'Skills' },
    experience: { icon: <Target className="h-4 w-4" />, label: 'Experience' },
    projects: { icon: <Code className="h-4 w-4" />, label: 'Projects' },
    formatting: { icon: <CheckCircle className="h-4 w-4" />, label: 'Formatting / ATS' },
  };

  const verdictStyle = getVerdictStyle(roast.verdict);

  return (
    <div className="space-y-6">
      {/* Verdict Card - TOP */}
      <div className={`${verdictStyle.bg} text-primary-foreground rounded-2xl p-6 text-center`}>
        <div className="text-4xl mb-2">{verdictStyle.emoji}</div>
        <div className="text-3xl font-bold mb-1">
          {roast.shortlist_probability}% Shortlist Chance
        </div>
        <p className="text-primary-foreground/90 font-medium text-lg mb-2">
          Verdict: {verdictStyle.text}
        </p>
        <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
          {roast.verdict_reason}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${getScoreBg(roast.shortlist_probability)} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${getScoreColor(roast.shortlist_probability)}`}>
            {roast.shortlist_probability}%
          </p>
          <p className="text-xs text-muted-foreground">Shortlist</p>
        </div>
        <div className={`${getScoreBg(roast.ats_score)} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${getScoreColor(roast.ats_score)}`}>
            {roast.ats_score}%
          </p>
          <p className="text-xs text-muted-foreground">ATS Score</p>
        </div>
        <div className={`${getScoreBg(roast.keyword_match_percent)} rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${getScoreColor(roast.keyword_match_percent)}`}>
            {roast.keyword_match_percent}%
          </p>
          <p className="text-xs text-muted-foreground">Keywords</p>
        </div>
      </div>

      {/* Why You'll Get Rejected */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
        <h3 className="font-bold text-destructive mb-3 flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Why You'll Get Rejected
        </h3>
        <div className="space-y-2">
          {roast.top_3_rejection_reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-destructive/20 text-destructive rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <p className="text-foreground text-sm">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section-by-Section Roasts */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Section Roasts 🔥</h3>
        
        {Object.entries(roast.sections).map(([key, section]) => {
          const meta = sectionMeta[key] || { icon: <Zap className="h-4 w-4" />, label: key };
          const isExpanded = expandedSections[key];
          
          return (
            <div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getScoreBg(section.score)}`}>
                    {meta.icon}
                  </div>
                  <span className="font-medium">{meta.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getScoreColor(section.score)}`}>
                    {section.score}/100
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <p className="text-muted-foreground text-sm">{section.roast}</p>
                  
                  {section.missing_skills && section.missing_skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-destructive mb-1">Missing skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {section.missing_skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {section.weak_bullets && section.weak_bullets.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-warning mb-1">Weak bullets:</p>
                      <ul className="space-y-1">
                        {section.weak_bullets.slice(0, 2).map((bullet, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <XCircle className="h-3 w-3 mt-0.5 text-warning flex-shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.issues && section.issues.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-warning mb-1">Issues:</p>
                      <ul className="space-y-1">
                        {section.issues.map((issue, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-warning flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ATS + JD Match */}
      <div className="bg-muted/50 rounded-xl p-5 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          JD Match Analysis
        </h3>
        
        {roast.keyword_gaps.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Missing keywords from JD:</p>
            <div className="flex flex-wrap gap-1">
              {roast.keyword_gaps.slice(0, 10).map((keyword, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {roast.jd_mismatch.missing_requirements.length > 0 && (
          <div>
            <p className="text-sm font-medium text-destructive mb-1">Missing requirements:</p>
            <ul className="space-y-1">
              {roast.jd_mismatch.missing_requirements.slice(0, 4).map((req, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-destructive">•</span> {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fix Suggestions - LOCKED/BLURRED */}
      <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-5 overflow-hidden">
        <div className="blur-locked select-none pointer-events-none">
          <h3 className="font-bold mb-3">🔧 Fix These 3 Things</h3>
          <div className="space-y-3">
            <div className="bg-card p-3 rounded-lg">
              <p className="font-medium">Rewritten Summary</p>
              <p className="text-sm text-muted-foreground">Your new professional summary optimized for this role...</p>
            </div>
            <div className="bg-card p-3 rounded-lg">
              <p className="font-medium">Fixed Bullet Points</p>
              <p className="text-sm text-muted-foreground">2-3 rewritten bullets with impact metrics...</p>
            </div>
            <div className="bg-card p-3 rounded-lg">
              <p className="font-medium">Skills to Add</p>
              <p className="text-sm text-muted-foreground">Missing skills that match the job description...</p>
            </div>
          </div>
        </div>
        
        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
          <Lock className="h-8 w-8 text-primary mb-2" />
          <p className="font-bold text-lg mb-1">Fix these and improve your chances</p>
          <p className="text-sm text-muted-foreground mb-4">Get copy-paste ready fixes</p>
          <Button onClick={onGetFix} className="fire-gradient text-primary-foreground btn-glow">
            <Sparkles className="h-4 w-4 mr-2" />
            Unlock Fixes
          </Button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onGetFix}
          size="lg"
          className="flex-1 fire-gradient text-primary-foreground font-bold btn-glow"
        >
          <Zap className="h-5 w-5 mr-2" />
          Get Fixed Resume
        </Button>
        <Button 
          onClick={onTryAgain}
          variant="outline"
          size="lg"
        >
          Try Another
        </Button>
      </div>
    </div>
  );
};

export default RoastResultDisplay;