'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Signal, SignalImage } from '@/types/signal';
import { PageTransition } from '@/components/PageTransition';
import { BackgroundEffects } from '@/app/signals/components/BackgroundEffects';
import { SignalSkeletonList } from '@/app/signals/components/SignalSkeleton';

export default function IndicatorGalleryPage() {
  const router = useRouter();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [images, setImages] = useState<SignalImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SignalImage | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'symbol'>('date');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/signals');
      if (!response.ok) throw new Error('Failed to fetch signals');
      
      const data = await response.json();
      setSignals(data.signals);
      
      const imageList: SignalImage[] = [];
      data.signals.forEach((signal: Signal) => {
        if (signal.indicatorImagePath) {
          imageList.push({
            id: `${signal.id}-indicator`,
            signalId: signal.id,
            type: 'indicator',
            path: signal.indicatorImagePath,
            timestamp: signal.timestamp,
            symbol: signal.symbol
          });
        }
      });
      
      setImages(imageList);
      setError(null);
    } catch (err) {
      setError('Görüntüler yüklenemedi');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedImages = () => {
    const grouped = new Map<string, SignalImage[]>();
    
    images.forEach(image => {
      const key = sortBy === 'symbol' ? image.symbol : new Date(image.timestamp).toLocaleDateString('tr-TR');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(image);
    });
    
    return Array.from(grouped.entries()).sort((a, b) => {
      if (sortBy === 'date') {
        return b[1][0].timestamp - a[1][0].timestamp;
      }
      return a[0].localeCompare(b[0]);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignalForImage = (image: SignalImage): Signal | undefined => {
    return signals.find(s => s.id === image.signalId);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImage(images[newIndex]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <BackgroundEffects />
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <div className="w-48 h-12 bg-white/10 rounded-xl animate-pulse mb-6" />
            <div className="w-64 h-16 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <SignalSkeletonList count={3} />
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
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="group mb-6 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-purple-500/50 text-white rounded-xl transition-all flex items-center gap-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Ana Sayfa
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                  İndikatör Resimleri
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Toplam {images.length} görüntü</span>
                </div>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'symbol')}
                className="px-4 py-3 bg-white/5 backdrop-blur-md text-white rounded-xl border-2 border-white/10 focus:border-purple-500 focus:outline-none transition-all cursor-pointer hover:bg-white/10"
              >
                <option value="date" className="bg-[#1a1a2e]">📅 Tarihe Göre</option>
                <option value="symbol" className="bg-[#1a1a2e]">💰 Coin'e Göre</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fadeIn">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-8xl mb-6 animate-bounce">📷</div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Henüz görüntü yok
              </h2>
              <p className="text-gray-400 text-lg">
                Sinyal geldiğinde görüntüler burada görünecek
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedImages().map(([groupKey, groupImages], groupIndex) => (
                <div key={groupKey} className="animate-fadeInUp" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                    {groupKey}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupImages.map((image, index) => {
                      const signal = getSignalForImage(image);
                      return (
                        <div
                          key={image.id}
                          onClick={() => setSelectedImage(image)}
                          className="relative group cursor-pointer animate-fadeInUp"
                          style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                        >
                          {/* Gradient border effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                          
                          <div className="relative bg-white/5 backdrop-blur-md border-2 border-white/10 group-hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all group-hover:scale-[1.02]">
                            {/* Image Preview */}
                            <div className="relative aspect-video bg-black/30 flex items-center justify-center overflow-hidden">
                              {image.path ? (
                                <Image
                                  src={image.path}
                                  alt={`${image.symbol} indicator`}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              ) : (
                                <div className="text-gray-500 text-4xl">📊</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-lg font-semibold">🔍 Büyüt</span>
                              </div>
                            </div>
                            
                            {/* Info */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                                  {image.symbol}
                                </h3>
                                {signal && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    signal.signalType === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                    signal.signalType === 'SELL' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                  }`}>
                                    {signal.signalType === 'BUY' ? '📈' : signal.signalType === 'SELL' ? '📉' : '⚠️'} {signal.signalType}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">
                                {formatDate(image.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
              {/* Navigation Buttons */}
              <div className="absolute -top-4 right-0 md:top-4 md:right-4 flex gap-2 z-10">
                <button
                  onClick={() => navigateImage('prev')}
                  disabled={images.findIndex(img => img.id === selectedImage.id) === 0}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
                >
                  ← Önceki
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  disabled={images.findIndex(img => img.id === selectedImage.id) === images.length - 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
                >
                  Sonraki →
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg font-semibold"
                >
                  ✕ Kapat
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl p-4 md:p-6 mt-16 md:mt-0">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                    {selectedImage.symbol}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {formatDate(selectedImage.timestamp)}
                  </p>
                </div>
                
                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Indicator Image */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      İndikatör Görüntüsü
                    </h4>
                    <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden">
                      {selectedImage.path ? (
                        <Image
                          src={selectedImage.path}
                          alt="Indicator"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Görüntü yükleniyor...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Chart Image */}
                  {(() => {
                    const signal = getSignalForImage(selectedImage);
                    return signal?.chartImagePath && (
                      <div>
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <span className="text-2xl">📈</span>
                          Chart Görüntüsü
                        </h4>
                        <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden">
                          <Image
                            src={signal.chartImagePath}
                            alt="Chart"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Action Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const signal = getSignalForImage(selectedImage);
                      if (signal) router.push(`/signal/${signal.id}`);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 font-semibold"
                  >
                    → Sinyal Detayına Git
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
