
import React from 'react';
import { CheckCircle, ArrowLeft, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Rezoome
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                0 credits left
              </div>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-lg mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-4 sm:space-y-6">
            <p className="text-lg sm:text-xl text-black font-semibold">
              One price, lifetime access, everything included
            </p>
          </div>

          <div className="relative">
            {/* Go Back Button - positioned at top right of card */}
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute -top-2 -right-2 z-10 text-xs sm:text-sm h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                go back
              </Button>
            </Link>

            {/* Pricing Card */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="space-y-6 sm:space-y-8">
                {/* Price */}
                <div className="text-center space-y-2">
                  <div className="text-4xl sm:text-6xl font-bold text-black">
                    $5
                  </div>
                  <div className="text-black text-base sm:text-lg font-medium">lifetime access</div>
                </div>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "10 Credits",
                    "All customization Features", 
                    "Access to new features",
                    <span key="founder">
                      <a 
                        href="https://x.com/Lsc8954" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Chat with founder (Click to DM)
                      </a>
                    </span>
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className={`${index < 3 ? 'text-black font-medium' : 'text-foreground'} text-sm sm:text-base`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-2 sm:pt-4">
                  <Button 
                    size="lg"
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg h-auto rounded-xl transition-colors"
                  >
                    Sign in to buy
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative gradient blur */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl sm:rounded-3xl blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
