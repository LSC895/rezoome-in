
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Edit3, Save, X } from 'lucide-react';

interface EditableResumeProps {
  initialContent: string;
  onSave: (content: string) => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
}

export const EditableResume: React.FC<EditableResumeProps> = ({
  initialContent,
  onSave,
  onDownloadPDF,
  onDownloadDOCX
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave(content);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sora font-bold text-2xl text-foreground">
          Your Tailored Resume
        </h2>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Resume
              </Button>
              <Button
                onClick={onDownloadPDF}
                size="sm"
                className="gradient-purple text-white hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={onDownloadDOCX}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download DOCX
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-muted/30 rounded-2xl p-6">
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[600px] font-mono text-sm leading-relaxed resize-none border-0 focus:ring-0 bg-transparent"
            placeholder="Edit your resume content here..."
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
            {content}
          </pre>
        )}
      </div>

      {isEditing && (
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Edit your resume content above. You can modify any section, add details, or adjust formatting.
          </p>
        </div>
      )}
    </div>
  );
};
