import React from 'react';
import { CheckCircle, ArrowLeft, Twitter, Zap, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: <Star className="h-6 w-6" />,
      highlight: false,
      features: [
        '1 tailored resume per day',
        'ATS score & missing skills analysis',
        'Resume preview before download',
        'Sign in only when downloading',
      ],
      cta: 'Get Started Free',
      ctaVariant: 'outline' as const,
    },
    {
      name: '24-Hour Pass',
      price: '$3',
      period: 'one-time',
      icon: <Zap className="h-6 w-6" />,
      highlight: true,
      badge: 'Most Popular',
      features: [
        'Unlimited resume generations',
        '24-hour access window',
        'Priority AI processing',
        'Cover letter generation',
        'Perfect for job application sprints',
      ],
      cta: 'Get 24-Hour Access',
      ctaVariant: 'default' as const,
    },
    {
      name: 'Monthly Pro',
      price: '$9',
      period: '/month',
      icon: <Crown className="h-6 w-6" />,
      highlight: false,
      features: [
        'Unlimited resume generations',
        'Unlimited cover letters',
        'Priority AI processing',
        'Resume history & tracking',
        'Early access to new features',
        'Cancel anytime',
      ],
      cta: 'Go Pro',
      ctaVariant: 'outline' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Link to="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Rezoome
              </Link>
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

      {/* Pricing Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start for free. Upgrade when you need unlimited generations.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-card/80 backdrop-blur-sm border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  plan.highlight 
                    ? 'border-purple-500 ring-2 ring-purple-500/20 scale-105' 
                    : 'border-border/50'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="text-center space-y-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
                      plan.highlight 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button 
                          size="lg"
                          variant={plan.ctaVariant}
                          className={`w-full font-semibold ${
                            plan.highlight 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                              : ''
                          }`}
                        >
                          {plan.cta}
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Button 
                        size="lg"
                        variant={plan.ctaVariant}
                        className={`w-full font-semibold ${
                          plan.highlight 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                            : ''
                        }`}
                      >
                        {plan.name === 'Free' ? 'Current Plan' : plan.cta}
                      </Button>
                    </SignedIn>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-muted-foreground">
              Questions? <a 
                href="https://x.com/Lsc8954" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                Chat with the founder
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              All plans include ATS optimization, keyword matching, and professional formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
