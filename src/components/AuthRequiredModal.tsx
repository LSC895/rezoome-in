import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Download, Sparkles } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'download' | 'copy' | 'generate_limit';
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  action
}) => {
  const getContent = () => {
    switch (action) {
      case 'download':
        return {
          icon: <Download className="h-12 w-12 text-purple-500" />,
          title: 'Create a free account to download',
          description: 'Sign up in seconds to download your optimized resume as PDF. Your resume is ready and waiting!'
        };
      case 'copy':
        return {
          icon: <Lock className="h-12 w-12 text-purple-500" />,
          title: 'Sign in to copy your resume',
          description: 'Create a free account to copy your tailored resume text.'
        };
      case 'generate_limit':
        return {
          icon: <Sparkles className="h-12 w-12 text-purple-500" />,
          title: 'Daily limit reached',
          description: 'You\'ve used your free resume generation for today. Sign in for unlimited generations or upgrade to a plan.'
        };
      default:
        return {
          icon: <Lock className="h-12 w-12 text-purple-500" />,
          title: 'Sign in required',
          description: 'Please sign in to continue.'
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {content.icon}
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <SignInButton mode="modal">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Sign in / Sign up free
            </Button>
          </SignInButton>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>✓ Free account • ✓ No credit card required • ✓ 1 resume/day free</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
