'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chart } from './Chart';
import { CustomIndicator } from './CustomIndicator';
import { IndicatorSettingsPanel } from './IndicatorSettings';
import { IndicProCombined } from './IndicProCombined';
import { binanceAPI, BinanceAPIError } from '@/lib/binance';
import { createCustomIndicator } from '@/lib/indicators/customIndicator';
import { OHLCVData, TimeRange } from '@/types';
import { IndicatorSettings, defaultIndicatorSettings } from '@/types/indicator';
import { screenshotService } from '@/lib/screenshot';
import { Signal } from '@/types/signal';

interface ChartViewProps {
  symbol: string;
}

export default function ChartViewWrapper({ symbol }: ChartViewProps) {
  const [chartData, setChartData] = useState<OHLCVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [interval, setInterval] = useState<string>('3m');
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>(defaultIndicatorSettings);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCompleted, setCaptureCompleted] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const indicator1Ref = useRef<HTMLDivElement>(null);
  const indicator2Ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const captureScreenshots = useCallback(async () => {
    if (!indicator1Ref.current || !indicator2Ref.current || !currentPrice) return;

    const signalId = searchParams.get('signalId');
    if (!signalId) {
      console.log('No signalId provided, skipping screenshot');
      return;
    }

    setIsCapturing(true);
    try {
      // Wait for charts to fully render - check if canvas has actual content
      console.log('Waiting for charts to render...');

      const waitForCanvas = async (ref: React.RefObject<HTMLDivElement | null>, name: string, maxWait = 15000) => {
        const startTime = Date.now();
        let checkCount = 0;

        while (Date.now() - startTime < maxWait) {
          checkCount++;
          const canvas = ref.current?.querySelector('canvas') as HTMLCanvasElement;

          if (canvas && canvas.width > 0 && canvas.height > 0) {
            try {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Sample multiple points across the canvas
                const samplePoints = [
                  { x: Math.floor(canvas.width * 0.25), y: Math.floor(canvas.height * 0.5) },
                  { x: Math.floor(canvas.width * 0.5), y: Math.floor(canvas.height * 0.5) },
                  { x: Math.floor(canvas.width * 0.75), y: Math.floor(canvas.height * 0.5) },
                ];

                let coloredPixels = 0;
                for (const point of samplePoints) {
                  const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
                  // Check if pixel is not black/dark (RGB > 20)
                  if (pixel[0] > 20 || pixel[1] > 20 || pixel[2] > 20) {
                    coloredPixels++;
                  }
                }

                // Need at least 2 out of 3 sample points to have color
                if (coloredPixels >= 2) {
                  console.log(`${name} canvas ready after ${checkCount} checks (${Date.now() - startTime}ms)`);
                  // Wait a bit more to ensure animation is complete
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  return true;
                }
              }
            } catch (error) {
              console.warn(`Error checking ${name} canvas:`, error);
            }
          }

          await new Promise(resolve => setTimeout(resolve, 800));
        }

        console.warn(`${name} canvas timeout after ${checkCount} checks`);
        return false;
      };

      // Wait for both canvases to have content
      console.log('Waiting for indicator canvases...');
      const results = await Promise.all([
        waitForCanvas(indicator1Ref, 'Indicator 1'),
        waitForCanvas(indicator2Ref, 'Indicator 2')
      ]);

      if (!results[0] || !results[1]) {
        console.error('One or more canvases failed to render properly');
      }

      // Extra safety delay for any remaining animations
      console.log('Final safety delay before capture...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capture indicators using Lightweight Charts' built-in screenshot functionality

      // Find and trigger screenshot buttons for both indicators
      const indicator1Button = indicator1Ref.current.querySelector('[title="Take a screenshot"]') as HTMLElement;
      const indicator2Button = indicator2Ref.current.querySelector('[title="Take a screenshot"]') as HTMLElement;

      let indicator1Blob: Blob;
      let indicator2Blob: Blob;

      // Capture CustomIndicator - use canvas.toDataURL() like the screenshot button does
      const indicator1Canvas = indicator1Ref.current.querySelector('canvas') as HTMLCanvasElement;
      if (indicator1Canvas) {
        console.log('Capturing CustomIndicator canvas with toDataURL');
        const dataUrl = indicator1Canvas.toDataURL('image/png', 1.0);
        const response = await fetch(dataUrl);
        indicator1Blob = await response.blob();
      } else {
        console.log('CustomIndicator canvas not found, using fallback');
        indicator1Blob = await screenshotService.captureIndicator(indicator1Ref.current);
      }

      // Capture IndicProCombined - use canvas.toDataURL() like the screenshot button does
      const indicator2Canvas = indicator2Ref.current.querySelector('canvas') as HTMLCanvasElement;
      if (indicator2Canvas) {
        console.log('Capturing IndicProCombined canvas with toDataURL');
        const dataUrl = indicator2Canvas.toDataURL('image/png', 1.0);
        const response = await fetch(dataUrl);
        indicator2Blob = await response.blob();
      } else {
        console.log('IndicProCombined canvas not found, using fallback');
        indicator2Blob = await screenshotService.captureIndicator(indicator2Ref.current);
      }

      const formData = new FormData();
      formData.append('signalId', signalId);
      formData.append('chartImage', indicator1Blob, `indicator1-${Date.now()}.png`);
      formData.append('indicatorImage', indicator2Blob, `indicator2-${Date.now()}.png`);

      const response = await fetch('/api/save-signal-images', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('Screenshots saved successfully');
        setCaptureCompleted(true);

        // Redirect back to signals page after successful capture
        setTimeout(() => {
          router.push('/signals');
        }, 1000);
      } else {
        console.error('Failed to save screenshots');
      }
    } catch (error) {
      console.error('Failed to capture screenshots:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [symbol, currentPrice, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try with original symbol first
        let data;
        try {
          data = await binanceAPI.getKlines(symbol, interval, 500);
        } catch (firstError) {
          // If failed and symbol doesn't end with .P, try with .P (perpetual)
          if (!symbol.endsWith('.P')) {
            console.log(`Failed to fetch ${symbol}, trying ${symbol}.P`);
            try {
              data = await binanceAPI.getKlines(`${symbol}.P`, interval, 500);
              console.log(`Successfully fetched data for ${symbol}.P`);
            } catch (secondError) {
              // If both failed, throw the original error
              throw firstError;
            }
          } else {
            throw firstError;
          }
        }

        setChartData(data);

        if (data.length > 0) {
          const latest = data[data.length - 1];
          const previous = data[data.length - 2];
          setCurrentPrice(latest.close);

          if (previous) {
            const change = ((latest.close - previous.close) / previous.close) * 100;
            setPriceChange(change);
          }
        }
      } catch (err) {
        if (err instanceof BinanceAPIError) {
          setError(err.message);
        } else {
          setError('Failed to load chart data');
        }

        // If in auto-capture mode, redirect back to signals page after error
        const isAutoCapture = searchParams.get('capture') === 'true';
        if (isAutoCapture) {
          console.log('Auto-capture mode: Error occurred, redirecting to signals page');
          setTimeout(() => {
            router.push('/signals');
          }, 2000); // Wait 2 seconds to show error message
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, interval, searchParams, router]);

  useEffect(() => {
    const captureSignal = searchParams.get('capture');
    if (captureSignal === 'true' && !isLoading && chartData.length > 0 && !captureCompleted && !isCapturing) {
      const timer = setTimeout(() => {
        captureScreenshots();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, isLoading, chartData, captureCompleted, isCapturing, captureScreenshots]);

  const handleBack = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] flex items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10 text-center max-w-md">
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-xl transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
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
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                title="Back to search"
              >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary">{symbol}</h1>
                  {priceChange !== 0 && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${priceChange >= 0
                      ? 'bg-success/10 text-success'
                      : 'bg-error/10 text-error'
                      }`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  )}
                </div>
                {currentPrice && (
                  <p className="text-lg md:text-xl font-semibold text-text-primary mt-1">
                    ${currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })}
                  </p>
                )}
              </div>
            </div>


            <div className="flex items-center gap-2">
              {['1m', '3m', '5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setInterval(timeframe)}
                  className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${interval === timeframe
                    ? 'bg-primary text-white'
                    : 'bg-surface-elevated hover:bg-surface text-text-muted hover:text-text-primary border border-border'
                    }`}
                >
                  {timeframe.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {isCapturing && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-primary text-white rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ekran görüntüsü alınıyor...</span>
          </div>
        )}

        {captureCompleted && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-success text-white rounded-lg shadow-lg flex items-center gap-2">
            <span>✓</span>
            <span>Screenshot kaydedildi!</span>
          </div>
        )}

        <div ref={indicator1Ref} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 md:p-6">
          <CustomIndicator
            priceData={chartData}
            timeRange={timeRange}
            indicator={createCustomIndicator(indicatorSettings)}
            indicatorSettings={indicatorSettings}
            onSettingsChange={setIndicatorSettings}
            onTimeRangeChange={setTimeRange}
            autoCapture={searchParams.get('capture') === 'true'}
          />
        </div>

        <div ref={indicator2Ref} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 md:p-6">
          <IndicProCombined
            priceData={chartData}
            timeRange={timeRange}
            autoCapture={searchParams.get('capture') === 'true'}
            onTimeRangeChange={setTimeRange}
          />
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
}
