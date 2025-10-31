'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { binanceAPI, BinanceAPIError } from '@/lib/binance';
import NavigationButtons from './NavigationButtons';

export const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a coin symbol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await binanceAPI.validateSymbol(query.trim());
      
      if (!isValid) {
        setError('Coin not found. Please try another symbol.');
        setIsLoading(false);
        return;
      }

      router.push(`/chart/${query.trim().toUpperCase()}`);
    } catch (err) {
      setIsLoading(false);
      
      if (err instanceof BinanceAPIError) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const popularCoins = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT'];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Navigation Buttons */}
      <NavigationButtons />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full max-w-3xl">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-purple-300 text-sm font-medium">Live Market Data</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            Crypto Charts
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            Search any cryptocurrency to view live charts
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search coin (e.g., BTCUSDT, ETHUSDT)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value.toUpperCase());
                  setError(null);
                }}
                disabled={isLoading}
                className="relative w-full h-16 px-6 pr-32 text-lg bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-3 px-4 py-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Popular Coins */}
        <div>
          <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Popular coins:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularCoins.map((coin) => (
              <button
                key={coin}
                onClick={() => {
                  setQuery(coin);
                  setError(null);
                }}
                className="group relative h-14 px-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 text-white rounded-xl transition-all font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all"></div>
                <span className="relative z-10">{coin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes gridMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }
      `}</style>
    </div>
  );
};
