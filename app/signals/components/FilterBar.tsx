'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { debounce, ANIMATION_TIMINGS } from '../utils/animationHelpers';
import { getActiveFilterCount } from '../utils/signalFormatters';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'ALL' | 'LONG' | 'SHORT' | 'ALERT';
  onFilterTypeChange: (type: 'ALL' | 'LONG' | 'SHORT' | 'ALERT') => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
}

export const FilterBar = React.memo(({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  sortOrder,
  onSortOrderChange
}: FilterBarProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const activeFilterCount = getActiveFilterCount(searchQuery, filterType);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, ANIMATION_TIMINGS.searchDebounce),
    [onSearchChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const filterButtons = [
    { value: 'ALL' as const, label: 'Tüm Sinyaller', icon: '📊' },
    { value: 'LONG' as const, label: 'Long', icon: '📈' },
    { value: 'SHORT' as const, label: 'Short', icon: '📉' },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Enhanced Search Input */}
        <div className="relative group md:col-span-2">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-30 group-focus-within:opacity-40 blur transition-opacity"></div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
              🔍
            </div>
            <input
              type="text"
              placeholder="Coin ara (örn: BTC, ETH)"
              value={localSearch}
              onChange={handleSearchChange}
              className="relative w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md text-white placeholder:text-gray-500 rounded-xl border-2 border-white/10 focus:border-purple-500 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Sort Dropdown */}
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'newest' | 'oldest')}
          className="px-4 py-3 bg-white/5 backdrop-blur-md text-white rounded-xl border-2 border-white/10 focus:border-purple-500 focus:outline-none transition-all cursor-pointer hover:bg-white/10"
        >
          <option value="newest" className="bg-[#1a1a2e]">🕐 En Yeni</option>
          <option value="oldest" className="bg-[#1a1a2e]">🕑 En Eski</option>
        </select>
      </div>

      {/* Filter Buttons Row */}
      <div className="relative flex flex-wrap gap-3">
        {filterButtons.map((button) => {
          const isActive = filterType === button.value;
          return (
            <button
              key={button.value}
              onClick={() => onFilterTypeChange(button.value)}
              className={`
                relative px-6 py-2.5 rounded-full text-sm font-semibold border-2 
                transition-all duration-200 
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/30 scale-105' 
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:scale-105 hover:text-white'
                }
                active:scale-95
              `}
            >
              <span className="flex items-center gap-2">
                <span>{button.icon}</span>
                <span>{button.label}</span>
              </span>
            </button>
          );
        })}

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && (
          <div className="flex items-center ml-auto">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-lg animate-scaleIn">
              {activeFilterCount} filtre aktif
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
