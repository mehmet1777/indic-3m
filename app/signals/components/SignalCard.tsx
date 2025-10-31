'use client';

import React from 'react';
import { SignalDisplayData } from '../utils/signalFormatters';
import { getStaggerDelay } from '../utils/animationHelpers';

interface SignalCardProps {
  signal: SignalDisplayData;
  index: number;
  onClick: () => void;
}

export const SignalCard = React.memo(({ signal, index, onClick }: SignalCardProps) => {
  const getSignalColor = (type: string) => {
    switch (type) {
      case 'LONG': 
        return {
          badge: 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50',
          glow: 'bg-green-500/50',
          icon: '📈'
        };
      case 'SHORT': 
        return {
          badge: 'text-red-400 bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/50',
          glow: 'bg-red-500/50',
          icon: '📉'
        };
      case 'ALERT': 
        return {
          badge: 'text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50',
          glow: 'bg-yellow-500/50',
          icon: '⚠️'
        };
      default: 
        return {
          badge: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
          glow: 'bg-gray-500/50',
          icon: '📊'
        };
    }
  };

  const signalStyle = getSignalColor(signal.signalType);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer animate-fadeInUp"
      style={{ 
        animationDelay: `${getStaggerDelay(index)}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* NEW Badge for recent signals */}
      {signal.isNew && (
        <div className="absolute -top-2 -right-2 z-10 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
          YENİ
        </div>
      )}

      {/* Gradient border effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
      
      {/* Card Container - Glassmorphic */}
      <div className="relative bg-white/5 backdrop-blur-md border-2 border-white/10 group-hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(139,92,246,0.3),0_0_60px_rgba(236,72,153,0.2)] active:scale-[0.98]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Signal Header */}
            <div className="flex items-center gap-3 mb-4">
              {/* Symbol with Glow */}
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full blur ${signalStyle.glow}`}></div>
                <h3 className="relative text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                  {signal.symbol}
                </h3>
              </div>
              
              {/* Signal Type Badge */}
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${signalStyle.badge} shadow-lg`}>
                {signalStyle.icon} {signal.signalType}
              </span>
            </div>
            
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Price Display */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-gray-400 text-xs block mb-1">Fiyat</span>
                <span className="text-white text-xl font-bold font-mono block">
                  {signal.formattedPrice}
                </span>
              </div>
              
              {/* Timestamp Display */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-gray-400 text-xs block mb-1">Zaman</span>
                <span className="text-gray-300 text-sm block">
                  {signal.relativeTime}
                </span>
              </div>
            </div>

            {/* Metadata Badges */}
            {(signal.indicatorName || signal.confidencePercent) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                {signal.indicatorName && (
                  <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">
                    {signal.indicatorName}
                  </span>
                )}
                {signal.confidencePercent && (
                  <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">
                    {signal.confidencePercent}% güven
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Arrow Icon */}
          <div className="text-gray-400 group-hover:text-purple-400 transition-colors text-2xl group-hover:translate-x-1 transition-transform duration-300">
            →
          </div>
        </div>
      </div>
    </div>
  );
});

SignalCard.displayName = 'SignalCard';
