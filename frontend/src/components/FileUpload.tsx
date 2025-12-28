import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.doc'];

const isValidFile = (file: File): boolean => {
  const hasValidType = ACCEPTED_TYPES.includes(file.type);
  const hasValidExtension = ACCEPTED_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  return hasValidType || hasValidExtension;
};

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    } else if (file) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isValidFile(file)) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload a PDF, DOCX, or TXT file');
      }
    }
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  if (selectedFile) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? 'Analyzing...' : 'Analyze resume'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragOver 
          ? 'border-foreground bg-muted/20' 
          : 'border-border hover:border-muted-foreground'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="space-y-4">
        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Drop your resume here
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse • PDF, DOCX, or TXT
          </p>
        </div>
      </div>
      
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
