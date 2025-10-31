'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types/signal';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { SignalCard } from './components/SignalCard';
import { FilterBar } from './components/FilterBar';
import { EmptyState } from './components/EmptyState';
import { SignalSkeletonList } from './components/SignalSkeleton';
import { BackgroundEffects } from './components/BackgroundEffects';
import { CleanupControls } from './components/CleanupControls';
import { transformSignalForDisplay, SignalDisplayData } from './utils/signalFormatters';

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<SignalDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LONG' | 'SHORT' | 'ALERT'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [signals, searchQuery, filterType, sortOrder]);

  const applyFilters = () => {
    let filtered = signals.map(transformSignalForDisplay);

    if (searchQuery) {
      filtered = filtered.filter(signal =>
        signal.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(signal => signal.signalType === filterType);
    }

    filtered.sort((a, b) => {
      return sortOrder === 'newest' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp;
    });

    setFilteredSignals(filtered);
    setPage(1);
  };

  const paginatedSignals = filteredSignals.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals');
      if (!response.ok) throw new Error('Failed to fetch signals');
      
      const data = await response.json();
      setSignals(data.signals);
      setError(null);
    } catch (err) {
      setError('Failed to load signals');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <BackgroundEffects />
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6">
              Gelen Sinyaller
            </h1>
          </div>
          <SignalSkeletonList count={5} />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* Background Effects */}
        <BackgroundEffects />

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="group mb-6 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Ana Sayfa
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                  Gelen Sinyaller
                </h1>
                <div className="flex items-center gap-4 text-gray-400 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Toplam {signals.length} sinyal</span>
                  </div>
                  <span>•</span>
                  <span>Gösterilen {filteredSignals.length}</span>
                </div>
              </div>
              
              {/* Live indicator */}
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm flex items-center gap-2 w-fit">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          {/* Cleanup Controls */}
          <CleanupControls
            signalCount={signals.length}
            onCleanupComplete={fetchSignals}
          />

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fadeIn">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty States */}
          {filteredSignals.length === 0 && signals.length > 0 ? (
            <EmptyState type="no-results" />
          ) : signals.length === 0 ? (
            <EmptyState type="no-signals" />
          ) : (
            <>
              {/* Signals Grid */}
              <div className="grid gap-4">
                {paginatedSignals.map((signal, index) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    index={index}
                    onClick={() => router.push(`/signal/${signal.id}`)}
                  />
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-semibold active:scale-95 min-h-[44px]"
                  >
                    ← Önceki
                  </button>
                  <div className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl min-h-[44px] flex items-center">
                    <span className="text-white font-semibold">
                      {page} / {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-semibold active:scale-95 min-h-[44px]"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
