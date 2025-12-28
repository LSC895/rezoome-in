import React from 'react';
import { Chrome, Download, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ChromeExtensionPromo = () => {
  const handleDownloadExtension = () => {
    // Create zip file with extension files and trigger download
    // For now, just show instructions
    window.open('/extension-instructions', '_blank');
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Chrome className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 New: Chrome Extension Available!
          </h3>
          <p className="text-gray-600 mb-4">
            Generate tailored resumes instantly from any job posting. Just right-click on job descriptions!
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>One-click generation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure & private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Chrome className="h-4 w-4 text-blue-500" />
              <span>Works on all job sites</span>
            </div>
          </div>
          
          <Button 
            onClick={handleDownloadExtension}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Extension
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChromeExtensionPromo;