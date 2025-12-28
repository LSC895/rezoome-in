import React from 'react';
import { Flame, ArrowRight, Eye, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-foreground">
              Rezoome
            </div>
            <div className="flex items-center gap-4">
              <Link to="/pricing">
                <Button variant="ghost" size="sm">Pricing</Button>
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline">Sign in</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm">
            <Eye className="h-4 w-4" />
            We listen and we Judge (😈)
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl leading-tight tracking-tight">
            One resume for every job
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            to make u built a resume that gets you interviews, not rejections.
          </p>

          <p className="text-sm text-primary font-medium">
            Free roast • Get it fixed instantly
          </p>

          {/* CTA */}
          <Button 
            size="lg" 
            className="text-base px-8 py-6 fire-gradient text-primary-foreground"
            onClick={() => navigate('/roast')}
          >
            <Flame className="h-5 w-5 mr-2" />
            Roast My Resume
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border space-y-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Shortlist %</h3>
                <p className="text-sm text-muted-foreground">
                  Know your real chances of getting shortlisted with a 0-100% score
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border space-y-3">
                <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Rejection Reasons</h3>
                <p className="text-sm text-muted-foreground">
                  See exactly why recruiters are passing on your resume
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border space-y-3">
                <div className="w-10 h-10 bg-success/10 text-success rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">One-Click Fix</h3>
                <p className="text-sm text-muted-foreground">
                  Get a job-tailored, ATS-optimized rewrite (1 free/day)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-center mb-12">How it works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Upload + Paste</h3>
                <p className="text-sm text-muted-foreground">Upload your resume and paste the job description</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Get Roasted</h3>
                <p className="text-sm text-muted-foreground">See your shortlist probability and rejection reasons</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mx-auto text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Get Fixed</h3>
                <p className="text-sm text-muted-foreground">One-click generates a job-tailored resume</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl">Simple Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Free</p>
                <p className="text-2xl font-bold">$0</p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Unlimited roasts</li>
                  <li>• 1 fix per day</li>
                  <li>• TXT download</li>
                </ul>
              </div>
              
              <div className="bg-card border-2 border-primary rounded-xl p-5 space-y-3 text-left relative">
                <div className="absolute -top-2.5 left-4">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Popular</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">24-Hour Pass</p>
                <p className="text-2xl font-bold">$3</p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Unlimited roasts</li>
                  <li>• Unlimited fixes</li>
                  <li>• TXT download</li>
                </ul>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly</p>
                <p className="text-2xl font-bold">$9<span className="text-base font-normal">/mo</span></p>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• Everything in Pass</li>
                  <li>• PDF downloads</li>
                  <li>• Cover letters</li>
                </ul>
              </div>
            </div>
            
            <Button 
              size="lg"
              onClick={() => navigate('/roast')}
              className="fire-gradient text-primary-foreground"
            >
              Start Free Roast
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>© 2024 Rezoome</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;