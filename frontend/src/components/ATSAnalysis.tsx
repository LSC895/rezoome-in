import React from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ATSAnalysisProps {
  atsScore: number;
  atsAnalysis?: {
    match_score: string;
    matched_skills: string[];
    missing_skills: string[];
    missing_keywords: string[];
    reasoning: string;
  };
}

export const ATSAnalysis: React.FC<ATSAnalysisProps> = ({ atsScore, atsAnalysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800';
    if (score >= 70) return 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800';
    return 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`bg-gradient-to-r ${getScoreBg(atsScore)} border rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ATS Compatibility Score
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {atsAnalysis?.reasoning || 'Your resume is optimized for applicant tracking systems'}
            </p>
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(atsScore)}`}>
            {atsScore}%
          </div>
        </div>
        
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full ${getProgressColor(atsScore)} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${atsScore}%` }}
          />
        </div>
      </div>

      {/* Skills Analysis */}
      {atsAnalysis && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Matched Skills */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
            <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5" />
              Matched Skills ({atsAnalysis.matched_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {atsAnalysis.matched_skills.length > 0 ? (
                atsAnalysis.matched_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No specific skills matched</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5" />
              Consider Adding ({atsAnalysis.missing_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {atsAnalysis.missing_skills.length > 0 ? (
                atsAnalysis.missing_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Great! No critical skills missing</span>
              )}
            </div>
            {atsAnalysis.missing_skills.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                💡 Only add these if you have actual experience with them
              </p>
            )}
          </div>
        </div>
      )}

      {/* ATS Improvements Applied */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          ✨ ATS Improvements Applied
        </h4>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Action-driven bullet points
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Job description keywords added
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            ATS-safe formatting (no tables/icons)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Quantified achievements
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Clear section hierarchy
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Professional summary tailored
          </li>
        </ul>
      </div>
    </div>
  );
};
