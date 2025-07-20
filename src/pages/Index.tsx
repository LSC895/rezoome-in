
import React, { useState } from 'react';
import { Zap, Star, Users, ArrowRight } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import RoastResult from '@/components/RoastResult';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Mock data for demo
  const mockRoast = "Your resume reads like a grocery list from 2019. 'Responsible for managing tasks' - wow, groundbreaking stuff there! Your skills section is more scattered than my attention span during a Monday morning meeting. But hey, at least you used Comic Sans... wait, that's worse. Time to channel your inner Gordon Ramsay and give this resume the makeover it desperately needs! 🔥";
  
  const mockSections = [
    {
      name: "Contact Information",
      score: 85,
      feedback: "Solid contact info, but your email 'partyanimal2000@hotmail.com' isn't screaming 'hire me'"
    },
    {
      name: "Professional Summary",
      score: 45,
      feedback: "Generic fluff that could apply to literally any human with a pulse"
    },
    {
      name: "Work Experience",
      score: 72,
      feedback: "Good structure, but needs more quantifiable achievements and less buzzword bingo"
    },
    {
      name: "Skills",
      score: 38,
      feedback: "Your skills section looks like you threw darts at a tech dictionary blindfolded"
    },
    {
      name: "Education",
      score: 90,
      feedback: "Clean and professional - this section actually knows what it's doing"
    }
  ];

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsLoading(false);
    setShowResults(true);
    
    toast({
      title: "Resume roasted! 🔥",
      description: "Your resume has been thoroughly analyzed and roasted.",
    });
  };

  const handleTryAgain = () => {
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <RoastResult
            roast={mockRoast}
            atsScore={66}
            sections={mockSections}
            onTryAgain={handleTryAgain}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="font-sora font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-gray-900">
                Roast your resume,<br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  get hired
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Get brutally honest feedback and ATS scoring that actually helps you land interviews. No fluff, just results.
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="font-sora font-bold text-2xl text-purple-600">12k+</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">Resumes Roasted</div>
              </div>
              <div className="text-center">
                <div className="font-sora font-bold text-2xl text-purple-600">89%</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">Got Interviews</div>
              </div>
              <div className="text-center">
                <div className="font-sora font-bold text-2xl text-purple-600">4.9★</div>
                <div className="text-gray-500 text-sm uppercase tracking-wide">User Rating</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Instant results, no signup required</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">AI-powered ATS compatibility scoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Viral-style roasts that actually help</span>
              </div>
            </div>
          </div>

          {/* Right Side - Upload Form */}
          <div className="lg:pl-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="font-sora font-bold text-2xl text-gray-900 mb-2">
                  Try it now - FREE 🔥
                </h2>
                <p className="text-gray-600">
                  Upload your resume and get roasted in seconds
                </p>
              </div>

              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  🔒 Your resume is processed securely and never stored
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-sora font-bold text-3xl text-gray-900 mb-4">
              Loved by job seekers everywhere
            </h2>
            <p className="text-gray-600 text-lg">
              See what people are saying about their roasts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                text: "Got roasted so hard I rewrote my entire resume. Landed 3 interviews the next week! 🔥",
                author: "Sarah, Marketing Manager",
                rating: 5
              },
              {
                text: "The ATS score breakdown was eye-opening. Finally understand why my resume wasn't getting past the bots.",
                author: "Mike, Software Engineer",
                rating: 5
              },
              {
                text: "Hilarious roast but genuinely helpful feedback. Fixed my resume and got my dream job!",
                author: "Jessica, Designer",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="floating-card p-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-sora font-semibold text-gray-900">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-purple py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to roast your resume?
          </h2>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who've upgraded their resumes and landed their dream jobs
          </p>
          
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-sora font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            GET ROASTED NOW
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
