
import React from 'react';
import { Star, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoastResultProps {
  roast: string;
  atsScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
  }[];
  onTryAgain: () => void;
}

const RoastResult: React.FC<RoastResultProps> = ({ roast, atsScore, sections, onTryAgain }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Roast Section */}
      <div className="floating-card p-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center mb-6">
          <h2 className="font-sora font-bold text-2xl text-gray-900 mb-2">
            🔥 Resume Roast
          </h2>
          <p className="text-purple-600 font-medium">Brutally honest feedback</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-purple-100">
          <p className="text-lg leading-relaxed text-gray-800 font-medium">
            {roast}
          </p>
        </div>
      </div>

      {/* ATS Score */}
      <div className="floating-card p-8">
        <div className="text-center mb-6">
          <h2 className="font-sora font-bold text-2xl text-gray-900 mb-2">
            🤖 ATS Score
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <span className={`text-4xl font-sora font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}/100
            </span>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getScoreIcon(section.score)}
                  <span className="font-sora font-semibold text-gray-900">
                    {section.name}
                  </span>
                </div>
                <span className={`font-bold ${getScoreColor(section.score)}`}>
                  {section.score}/100
                </span>
              </div>
              <p className="text-gray-600 text-sm">{section.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="text-center space-y-4">
        <Button
          onClick={onTryAgain}
          variant="outline"
          className="font-sora font-semibold py-3 px-8 text-lg border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          ROAST ANOTHER RESUME
        </Button>
        
        <div className="floating-card p-6 bg-gradient-to-r from-purple-100 to-pink-100">
          <h3 className="font-sora font-bold text-lg text-gray-900 mb-2">
            Want unlimited roasts? 🚀
          </h3>
          <p className="text-gray-600 mb-4">
            Sign up to save your results and roast unlimited resumes
          </p>
          <Button className="gradient-purple text-white font-sora font-semibold py-3 px-8 text-lg hover:opacity-90">
            GET UNLIMITED ACCESS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoastResult;
