
import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

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
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (selectedFile) {
    return (
      <div className="floating-card p-6 text-center animate-scale-in">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FileText className="h-8 w-8 text-purple-600" />
          <div className="text-left">
            <p className="font-sora font-semibold text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={() => onFileSelect(selectedFile)}
          disabled={isLoading}
          className="w-full gradient-purple text-white font-sora font-semibold py-3 text-lg hover:opacity-90 transition-opacity"
        >
          {isLoading ? 'ROASTING YOUR RESUME...' : 'ROAST MY RESUME 🔥'}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`floating-card p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragOver 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-gray-300 hover:border-purple-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="text-center">
        <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
        <h3 className="font-sora font-semibold text-lg text-gray-900 mb-2">
          Drop your resume here
        </h3>
        <p className="text-gray-600 mb-4">
          or <span className="text-purple-600 font-medium">browse files</span>
        </p>
        <p className="text-sm text-gray-500">
          PDF files only • Max 10MB
        </p>
      </div>
      
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
