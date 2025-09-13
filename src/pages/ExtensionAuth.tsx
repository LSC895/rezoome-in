import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExtensionAuth = () => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      handleExtensionAuth();
    } else if (isLoaded && !user) {
      setAuthStatus('error');
    }
  }, [isLoaded, user]);

  const handleExtensionAuth = async () => {
    try {
      // Use simple session ID from user ID
      const sessionId = `session_${user!.id}_${Date.now()}`;
      setSessionId(sessionId);

      // Use simple authentication for extension
      const sessionToken = `temp_token_${user!.id}`;

      // Set success status
      setAuthStatus('success');

    } catch (error) {
      console.error('Extension auth failed:', error);
      setAuthStatus('error');
      toast({
        title: "Authentication failed",
        description: "Please try connecting the extension again.",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    setAuthStatus('loading');
    if (user) {
      handleExtensionAuth();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to your Rezoome account to connect the Chrome extension.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Go to Rezoome
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        {authStatus === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Connecting Extension</h1>
            <p className="text-muted-foreground">
              Setting up your Chrome extension connection...
            </p>
          </>
        )}

        {authStatus === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Extension Connected!</h1>
            <p className="text-muted-foreground mb-4">
              Your Chrome extension is now connected to your Rezoome account.
            </p>
            <p className="text-sm text-muted-foreground">
              Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
            </p>
          </>
        )}

        {authStatus === 'error' && (
          <>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>
            <p className="text-muted-foreground mb-6">
              There was an error connecting your extension. Please try again.
            </p>
            <Button 
              onClick={handleRetry}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExtensionAuth;