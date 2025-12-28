import React from 'react';
import { X, Zap, FileText, Download, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetFix: () => void;
  isLoading?: boolean;
  canGetFreefix?: boolean;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onGetFix,
  isLoading = false,
  canGetFreefix = true
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {canGetFreefix ? '🔥 Get Your Resume Fixed!' : '🚀 Upgrade for More Fixes'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Value Proposition */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {canGetFreefix 
                ? "Transform your roasted resume into an interview-winning document"
                : "You've used your free daily fix. Upgrade for unlimited access!"
              }
            </p>
          </div>

          {/* What You Get */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              What you'll get:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Complete ATS-optimized resume rewrite</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm">Tailored to your target job description</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Download className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm">Copy-paste ready text format</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          {canGetFreefix ? (
            <div className="space-y-3">
              <Button
                onClick={onGetFix}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Fixing your resume...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5" /> Get My Fixed Resume (Free)
                  </span>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                1 free fix per day • No credit card required
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pricing Tiers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-xl p-4 hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="text-center space-y-1">
                    <p className="font-bold text-xl">$3</p>
                    <p className="text-xs text-muted-foreground">24-hour pass</p>
                    <p className="text-xs">Unlimited fixes</p>
                  </div>
                </div>
                <div className="border-2 border-purple-500 rounded-xl p-4 relative cursor-pointer bg-purple-50">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">Popular</span>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-xl">$9<span className="text-sm font-normal">/mo</span></p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-xs">+ PDF & Cover Letter</p>
                  </div>
                </div>
              </div>

              <SignedOut>
                <SignUpButton mode="modal">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6">
                    <Crown className="h-5 w-5 mr-2" /> Sign Up to Upgrade
                  </Button>
                </SignUpButton>
              </SignedOut>
              
              <SignedIn>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-6"
                  onClick={() => window.location.href = '/pricing'}
                >
                  <Crown className="h-5 w-5 mr-2" /> View Pricing Plans
                </Button>
              </SignedIn>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;
