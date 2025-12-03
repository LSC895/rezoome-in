import React from 'react';
import { Phone, Mail, Linkedin, MapPin, Edit3, Download, Save, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  location?: string;
}

interface ResumeSection {
  title: string;
  content: string;
}

interface FormattedResumeProps {
  content: string;
  template: 'modern' | 'classic' | 'creative';
  contactInfo?: ContactInfo;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (content: string) => void;
  onCancel: () => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  onCopy?: () => void;
  isAuthenticated?: boolean;
}

export const FormattedResume: React.FC<FormattedResumeProps> = ({
  content,
  template,
  contactInfo,
  isEditing,
  onEditToggle,
  onSave,
  onCancel,
  onDownloadPDF,
  onDownloadDOCX,
  onCopy,
  isAuthenticated = true
}) => {
  const [editContent, setEditContent] = React.useState(content);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleSave = () => {
    onSave(editContent);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseResumeContent = (text: string) => {
    const sections: ResumeSection[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a section header (all caps or title case with specific keywords)
      if (trimmedLine && (
        /^[A-Z\s]{3,}$/.test(trimmedLine) || 
        /^(Professional Summary|Experience|Education|Skills|Work Experience|Certifications|Projects|Achievements|Key Skills|Contact Info|Contact Information)$/i.test(trimmedLine)
      )) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // Start new section
        currentSection = trimmedLine;
        currentContent = [];
      } else if (trimmedLine) {
        currentContent.push(line);
      }
    }

    // Don't forget the last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }

    return sections;
  };

  const getTemplateColors = () => {
    switch (template) {
      case 'modern':
        return {
          primary: 'text-blue-600 dark:text-blue-400',
          accent: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          header: 'bg-gradient-to-r from-blue-600 to-blue-700',
        };
      case 'classic':
        return {
          primary: 'text-green-700 dark:text-green-400',
          accent: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          header: 'bg-gradient-to-r from-green-600 to-green-700',
        };
      case 'creative':
        return {
          primary: 'text-purple-600 dark:text-purple-400',
          accent: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800',
          header: 'bg-gradient-to-r from-purple-600 to-purple-700',
        };
      default:
        return {
          primary: 'text-blue-600 dark:text-blue-400',
          accent: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          header: 'bg-gradient-to-r from-blue-600 to-blue-700',
        };
    }
  };

  const colors = getTemplateColors();
  const sections = parseResumeContent(content);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-sora font-bold text-2xl text-foreground">
            Edit Your Resume
          </h2>
          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-2xl p-6">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[600px] font-mono text-sm leading-relaxed resize-none border-0 focus:ring-0 bg-transparent"
            placeholder="Edit your resume content here..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-sora font-bold text-2xl text-foreground">
          Your Tailored Resume
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onEditToggle}
            variant="outline"
            size="sm"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {onCopy && (
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {isAuthenticated ? 'Copy' : 'Sign in to Copy'}
                </>
              )}
            </Button>
          )}
          <Button
            onClick={onDownloadPDF}
            size="sm"
            className="gradient-purple text-white hover:opacity-90"
          >
            <Download className="mr-2 h-4 w-4" />
            {isAuthenticated ? 'Download PDF' : 'Sign in to Download'}
          </Button>
          <Button
            onClick={onDownloadDOCX}
            variant="outline"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            DOCX
          </Button>
        </div>
      </div>

      {/* Resume Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
        {/* Content Sections */}
        <div className="p-8 space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className={`text-2xl font-bold ${colors.primary} border-b-2 ${colors.border} pb-2 font-sora`}>
                {section.title}
              </h2>
              <div className={`${colors.accent} p-6 rounded-xl`}>
                <div className="space-y-4">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="space-y-2">
                      {paragraph.split('\n').map((line, lIndex) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;

                        // Check if this is a bullet point
                        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                          return (
                            <div key={lIndex} className="flex items-start space-x-3 ml-4">
                              <div className={`w-2 h-2 rounded-full ${colors.primary.replace('text-', 'bg-')} mt-2 flex-shrink-0`}></div>
                              <p className="text-foreground leading-relaxed">{trimmedLine.substring(1).trim()}</p>
                            </div>
                          );
                        }

                        // Check if this looks like a job title or company (contains | or specific patterns)
                        if (trimmedLine.includes(' | ') || /^\w+.*\s+\|\s+\w+/.test(trimmedLine)) {
                          return (
                            <div key={lIndex} className="border-l-4 border-primary pl-4 py-2">
                              <h3 className="font-semibold text-lg text-foreground">{trimmedLine}</h3>
                            </div>
                          );
                        }

                        // Check if this looks like a date range
                        if (/\d{4}\s*[-–]\s*(\d{4}|Present|Current)/i.test(trimmedLine)) {
                          return (
                            <p key={lIndex} className={`text-sm ${colors.primary} font-medium`}>{trimmedLine}</p>
                          );
                        }

                        // Regular paragraph
                        return (
                          <p key={lIndex} className="text-foreground leading-relaxed">{trimmedLine}</p>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
