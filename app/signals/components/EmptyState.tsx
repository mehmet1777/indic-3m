'use client';

import React from 'react';

interface EmptyStateProps {
  type: 'no-signals' | 'no-results';
  message?: string;
  description?: string;
}

export const EmptyState = React.memo(({ type, message, description }: EmptyStateProps) => {
  const config = {
    'no-signals': {
      icon: '📊',
      defaultMessage: 'Henüz sinyal yok',
      defaultDescription: 'Sinyaller geldiğinde burada görünecek',
      animation: 'animate-bounce'
    },
    'no-results': {
      icon: '🔍',
      defaultMessage: 'Sonuç bulunamadı',
      defaultDescription: 'Arama kriterlerinizi değiştirmeyi deneyin',
      animation: 'animate-pulse'
    }
  };

  const { icon, defaultMessage, defaultDescription, animation } = config[type];

  return (
    <div className="text-center py-20 animate-fadeIn">
      <div className={`text-[96px] mb-6 ${animation}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-white mb-3">
        {message || defaultMessage}
      </h2>
      <p className="text-gray-400 text-lg">
        {description || defaultDescription}
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
