import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2 } from 'lucide-react';

interface LoadingSkeletonProps {
  progress?: number;
  status?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ progress = 50, status = 'Processing...' }) => {
  return (
    <div className="floating-card p-8 max-w-4xl mx-auto animate-scale-in">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Wand2 className="animate-spin h-8 w-8 text-primary mr-3" />
          <h3 className="font-sora font-bold text-2xl text-foreground">
            Generating Your Tailored Resume
          </h3>
        </div>
        <p className="text-muted-foreground mb-4">{status}</p>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">{progress}% Complete</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;