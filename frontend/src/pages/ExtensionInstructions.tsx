import React from 'react';
import { Chrome, Download, Upload, MousePointer, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const ExtensionInstructions = () => {
  const handleDownloadExtension = async () => {
    // Create a zip file with all extension files
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add all extension files to zip
    const files = {
      'manifest.json': await fetch('/extension/manifest.json').then(r => r.text()),
      'background.js': await fetch('/extension/background.js').then(r => r.text()),
      'content.js': await fetch('/extension/content.js').then(r => r.text()),
      'popup.html': await fetch('/extension/popup.html').then(r => r.text()),
      'popup.js': await fetch('/extension/popup.js').then(r => r.text()),
      'README.md': await fetch('/extension/README.md').then(r => r.text())
    };
    
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    // Create icons folder
    const iconsFolder = zip.folder('icons');
    // Add placeholder icons (you would replace these with actual icon files)
    iconsFolder?.file('icon16.png', 'placeholder');
    iconsFolder?.file('icon48.png', 'placeholder');
    iconsFolder?.file('icon128.png', 'placeholder');
    
    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rezoome-chrome-extension.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Rezoome Extension
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Chrome className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rezoome Chrome Extension
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate tailored resumes instantly from any job posting. Just right-click on job descriptions!
          </p>
        </div>

        {/* Download Section */}
        <Card className="p-8 text-center mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Download & Install</h2>
          <p className="text-muted-foreground mb-6">
            Get the extension files and follow the installation steps below.
          </p>
          <Button 
            onClick={handleDownloadExtension}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Extension Files
          </Button>
        </Card>

        {/* Installation Steps */}
        <div className="grid gap-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Installation Steps</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold text-lg">Download & Extract</h3>
              </div>
              <p className="text-muted-foreground">
                Download the extension files and extract the ZIP to a folder on your computer.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold text-lg">Open Chrome Extensions</h3>
              </div>
              <p className="text-muted-foreground">
                Go to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions/</code> in your Chrome browser.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold text-lg">Enable Developer Mode</h3>
              </div>
              <p className="text-muted-foreground">
                Toggle "Developer mode" in the top-right corner of the extensions page.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <h3 className="font-semibold text-lg">Load Extension</h3>
              </div>
              <p className="text-muted-foreground">
                Click "Load unpacked" and select the extracted extension folder.
              </p>
            </Card>
          </div>
        </div>

        {/* How to Use */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How to Use</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Chrome className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Connect Account</h3>
              <p className="text-sm text-muted-foreground">Click the extension icon and connect your Rezoome account</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Upload Resume</h3>
              <p className="text-sm text-muted-foreground">Upload your master resume through the extension popup</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Right-click Job</h3>
              <p className="text-sm text-muted-foreground">Select job description text and right-click to generate</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">4. Download Resume</h3>
              <p className="text-sm text-muted-foreground">Your tailored resume is generated and downloaded instantly</p>
            </div>
          </div>
        </Card>

        {/* Supported Sites */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Supported Job Portals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              'LinkedIn Jobs', 'Glassdoor', 'Indeed',
              'Naukri.com', 'Monster.com', 'ZipRecruiter'
            ].map((site) => (
              <div key={site} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">{site}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExtensionInstructions;