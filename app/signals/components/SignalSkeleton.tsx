'use client';

import React from 'react';

export const SignalSkeleton = React.memo(() => {
  return (
    <div className="relative bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-8 bg-white/10 rounded-lg animate-shimmer" />
            <div className="w-24 h-7 bg-white/10 rounded-full animate-shimmer" />
          </div>
          
          {/* Info grid skeleton */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="w-12 h-3 bg-white/10 rounded mb-2 animate-shimmer" />
              <div className="w-24 h-6 bg-white/10 rounded animate-shimmer" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="w-12 h-3 bg-white/10 rounded mb-2 animate-shimmer" />
              <div className="w-32 h-5 bg-white/10 rounded animate-shimmer" />
            </div>
          </div>

          {/* Metadata skeleton */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-16 h-6 bg-white/10 rounded-md animate-shimmer" />
            <div className="w-20 h-6 bg-white/10 rounded-md animate-shimmer" />
          </div>
        </div>
        
        {/* Arrow skeleton */}
        <div className="w-6 h-6 bg-white/10 rounded animate-shimmer" />
      </div>
    </div>
  );
});

SignalSkeleton.displayName = 'SignalSkeleton';

interface SignalSkeletonListProps {
  count?: number;
}

export const SignalSkeletonList = React.memo(({ count = 5 }: SignalSkeletonListProps) => {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SignalSkeleton key={index} />
      ))}
    </div>
  );
});

SignalSkeletonList.displayName = 'SignalSkeletonList';
