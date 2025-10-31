'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Signal } from '@/types/signal';
import { PageTransition } from '@/components/PageTransition';
import { BackgroundEffects } from '@/app/signals/components/BackgroundEffects';
import { SignalSkeletonList } from '@/app/signals/components/SignalSkeleton';
import { transformSignalForDisplay, SignalDisplayData } from '@/app/signals/utils/signalFormatters';

export default function SignalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const signalId = params.id as string;

  const [signal, setSignal] = useState<SignalDisplayData | null>(null);
  const [allSignals, setAllSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<'chart' | 'indicator' | null>(null);

  useEffect(() => {
    fetchSignalDetail();
  }, [signalId]);

  const fetchSignalDetail = async () => {
    try {
      const response = await fetch('/api/signals');
      if (!response.ok) throw new Error('Failed to fetch signals');

      const data = await response.json();
      setAllSignals(data.signals);

      const foundSignal = data.signals.find((s: Signal) => s.id === signalId);
      if (!foundSignal) {
        setError('Sinyal bulunamadı');
      } else {
        setSignal(transformSignalForDisplay(foundSignal));
      }
    } catch (err) {
      setError('Sinyal yüklenemedi');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSignalStyle = (type: string) => {
    switch (type) {
      case 'BUY': 
        return {
          badge: 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50',
          glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
          icon: '📈'
        };
      case 'SELL': 
        return {
          badge: 'text-red-400 bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/50',
          glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
          icon: '📉'
        };
      case 'ALERT': 
        return {
          badge: 'text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50',
          glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
          icon: '⚠️'
        };
      default: 
        return {
          badge: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
          glow: '',
          icon: '📊'
        };
    }
  };

  const navigateToSignal = (direction: 'prev' | 'next') => {
    const currentIndex = allSignals.findIndex(s => s.id === signalId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < allSignals.length) {
      router.push(`/signal/${allSignals[newIndex].id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <BackgroundEffects />
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <div className="w-48 h-12 bg-white/10 rounded-xl animate-pulse mb-6" />
            <div className="w-64 h-16 bg-white/10 rounded-xl animate-pulse mb-4" />
          </div>
          <SignalSkeletonList count={1} />
        </div>
      </div>
    );
  }

  if (error || !signal) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
          <BackgroundEffects />
          <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
            <div className="text-center animate-fadeIn">
              <div className="text-8xl mb-6 animate-bounce">❌</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {error || 'Sinyal bulunamadı'}
              </h2>
              <button
                onClick={() => router.push('/signals')}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30 font-semibold"
              >
                ← Sinyallere Dön
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const signalStyle = getSignalStyle(signal.signalType);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* Background Effects */}
        <BackgroundEffects />

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
          {/* Header Navigation */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => router.push('/signals')}
              className="group px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Sinyallere Dön
            </button>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigateToSignal('prev')}
                disabled={allSignals.findIndex(s => s.id === signalId) === 0}
                className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/10 hover:border-purple-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10 font-semibold"
              >
                ← Önceki
              </button>
              <button
                onClick={() => navigateToSignal('next')}
                disabled={allSignals.findIndex(s => s.id === signalId) === allSignals.length - 1}
                className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/10 hover:border-purple-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-white/10 font-semibold"
              >
                Sonraki →
              </button>
            </div>
          </div>

          {/* Signal Header Card */}
          <div className="relative group mb-8 animate-fadeInUp">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-20 blur"></div>
            <div className={`relative bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl p-6 md:p-8 ${signalStyle.glow}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                      {signal.symbol}
                    </h1>
                    {signal.isNew && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        YENİ
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-lg">
                    {signal.relativeTime}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${signalStyle.badge} shadow-lg whitespace-nowrap`}>
                    {signalStyle.icon} {signal.signalType}
                  </span>
                  <p className="text-white text-3xl font-mono font-bold">
                    {signal.formattedPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {signal.chartImagePath && (
              <div 
                className="relative group animate-fadeInUp cursor-pointer"
                style={{ animationDelay: '100ms' }}
                onClick={() => setSelectedImage('chart')}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-md border-2 border-white/10 group-hover:border-purple-500/50 rounded-2xl p-4 transition-all">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    İndikatör 1 Görüntüsü
                  </h3>
                  <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={signal.chartImagePath}
                      alt="Indicator 1 Screenshot"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">🔍 Büyüt</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {signal.indicatorImagePath && (
              <div 
                className="relative group animate-fadeInUp cursor-pointer"
                style={{ animationDelay: '200ms' }}
                onClick={() => setSelectedImage('indicator')}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                <div className="relative bg-white/5 backdrop-blur-md border-2 border-white/10 group-hover:border-pink-500/50 rounded-2xl p-4 transition-all">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    İndikatör 2 Görüntüsü
                  </h3>
                  <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform">
                    <Image
                      src={signal.indicatorImagePath}
                      alt="Indicator 2 Screenshot"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">🔍 Büyüt</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* No Images State */}
          {!signal.chartImagePath && !signal.indicatorImagePath && (
            <div className="text-center py-20 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl animate-fadeIn">
              <div className="text-8xl mb-6 animate-bounce">📷</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Görüntü Bulunamadı
              </h3>
              <p className="text-gray-400 text-lg">
                Bu sinyal için henüz görüntü kaydedilmemiş
              </p>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-6 animate-fadeIn"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-7xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 right-0 md:top-4 md:right-4 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-500 hover:to-pink-500 transition-all shadow-lg font-semibold z-10 flex items-center gap-2"
              >
                <span>✕</span>
                <span className="hidden sm:inline">Kapat</span>
              </button>
              <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl p-4 md:p-6 mt-16 md:mt-0">
                <p className="text-white text-center mb-4 text-xl md:text-2xl font-bold">
                  {selectedImage === 'chart' ? '📊 İndikatör 1 Görüntüsü' : '📈 İndikatör 2 Görüntüsü'}
                </p>
                <div className="relative w-full bg-black/30 rounded-xl overflow-hidden">
                  {selectedImage === 'chart' && signal.chartImagePath && (
                    <Image
                      src={signal.chartImagePath}
                      alt="Chart Screenshot"
                      width={1920}
                      height={1080}
                      className="w-full h-auto rounded-xl"
                      unoptimized
                    />
                  )}
                  {selectedImage === 'indicator' && signal.indicatorImagePath && (
                    <Image
                      src={signal.indicatorImagePath}
                      alt="Indicator Screenshot"
                      width={1920}
                      height={1080}
                      className="w-full h-auto rounded-xl"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
