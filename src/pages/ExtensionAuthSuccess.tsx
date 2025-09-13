import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExtensionAuthSuccess = () => {
  useEffect(() => {
    // Auto-close this tab after 3 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Extension Connected!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your Chrome extension is now connected to your Rezoome account.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          This window will close automatically, or you can close it now.
        </p>
        <Button 
          onClick={() => window.close()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          Close Window
        </Button>
      </div>
    </div>
  );
};

export default ExtensionAuthSuccess;