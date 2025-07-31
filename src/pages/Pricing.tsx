
import React from 'react';
import { CheckCircle, ArrowLeft, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Rezoome
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <p className="text-xl text-muted-foreground font-bold">
              One price, lifetime access, everything included
            </p>
          </div>

          <div className="relative">
            {/* Pricing Card */}
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="space-y-8">
                {/* Price */}
                <div className="text-center space-y-2">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    $5
                  </div>
                  <div className="text-muted-foreground text-lg">/ 10 credits</div>
                  <div className="text-muted-foreground text-sm">lifetime access</div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {[
                    "10 credits",
                    "All customization features", 
                    "Access to new features",
                    <span key="founder">
                      <a 
                        href="https://x.com/Lsc8954" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        Chat with founder (Click to DM)
                      </a>
                    </span>
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="space-y-4">
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
                  >
                    Sign in to buy
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative gradient blur */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
