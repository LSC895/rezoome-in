export type Tone = 'friendly' | 'hr' | 'senior' | 'dark';
export type Language = 'english' | 'hinglish';

export type RoastRequest = {
  resumeText: string;
  jobDescription?: string;
  tone: Tone;
  language: Language;
};

export type RoastResponse = {
  score: number;
  verdict: 'Apply' | "Don't Apply" | 'High Risk';
  roast: {
    summary: string;
    skills: string;
    projects: string;
    experience: string;
    formatting: string;
  };
  atsMatch: {
    percentage: number;
    missingSkills: string[];
  };
  fixes: {
    summaryFix: string;
    bulletFixes: string[];
  };
};
