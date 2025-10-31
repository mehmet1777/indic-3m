'use client';

import { useEffect, useRef, useState } from 'react';
import { Signal } from '@/types/signal';
import { useRouter, usePathname } from 'next/navigation';

export function SignalCaptureWorker() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const processedSignals = useRef<Set<string>>(new Set());
  const signalQueue = useRef<Signal[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load processed signals from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('processedSignals');
      if (stored) {
        const parsed = JSON.parse(stored);
        processedSignals.current = new Set(parsed);
        console.log(`Loaded ${processedSignals.current.size} processed signals from storage`);
      }
    } catch (error) {
      console.error('Error loading processed signals:', error);
    }
  }, []);

  // Save processed signals to localStorage whenever it changes
  const addProcessedSignal = (signalId: string) => {
    processedSignals.current.add(signalId);
    try {
      const array = Array.from(processedSignals.current);
      localStorage.setItem('processedSignals', JSON.stringify(array));
    } catch (error) {
      console.error('Error saving processed signals:', error);
    }
  };

  useEffect(() => {
    // Don't poll if we're on the chart page (to avoid interference)
    if (pathname?.startsWith('/chart/')) {
      return;
    }

    const pollInterval = setInterval(async () => {
      if (isCapturing) return; // Skip if already capturing

      try {
        const response = await fetch('/api/signals');
        const data = await response.json();
        
        if (data.signals && data.signals.length > 0) {
          for (const signal of data.signals) {
            // Check if signal needs screenshot and hasn't been processed
            if (
              (!signal.chartImagePath || !signal.indicatorImagePath) &&
              !processedSignals.current.has(signal.id) &&
              !signalQueue.current.find(s => s.id === signal.id)
            ) {
              console.log(`Adding signal to queue: ${signal.id} (${signal.symbol})`);
              signalQueue.current.push(signal);
              addProcessedSignal(signal.id);
            }
          }
          
          if (signalQueue.current.length > 0 && !isCapturing) {
            console.log(`Starting queue processing. Total signals: ${signalQueue.current.length}`);
            processQueue();
          }
        }
      } catch (error) {
        console.error('Error polling signals:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isCapturing, pathname]);

  const processQueue = async () => {
    if (isCapturing || signalQueue.current.length === 0) return;

    setIsCapturing(true);
    const signal = signalQueue.current.shift()!;
    setCurrentSignal(signal);

    try {
      console.log(`Processing signal: ${signal.id}`);
      router.push(`/chart/${signal.symbol}?capture=true&signalId=${signal.id}`);
      
      // Wait for screenshot to complete and redirect back
      // Increased timeout to handle errors (2s error display + redirect)
      await new Promise(resolve => setTimeout(resolve, 12000));
      
      setCurrentSignal(null);
      setIsCapturing(false);
      
      // Process next signal if any
      if (signalQueue.current.length > 0) {
        console.log(`Processing next signal in queue. Remaining: ${signalQueue.current.length}`);
        setTimeout(() => processQueue(), 2000);
      } else {
        console.log('All signals processed, staying on signals page');
      }
    } catch (error) {
      console.error('Error processing signal:', error);
      
      // Mark signal as processed even on error to avoid retry loop
      addProcessedSignal(signal.id);
      
      setIsCapturing(false);
      setCurrentSignal(null);
      
      // Process next signal if any
      if (signalQueue.current.length > 0) {
        console.log(`Error occurred, processing next signal. Remaining: ${signalQueue.current.length}`);
        setTimeout(() => processQueue(), 2000);
      }
    }
  };

  if (!isCapturing || !currentSignal) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-purple-500/40 border border-purple-400/30">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="font-bold text-lg">Screenshot alınıyor...</p>
          <p className="text-sm opacity-90">{currentSignal.symbol} - {currentSignal.signalType}</p>
          {signalQueue.current.length > 0 && (
            <p className="text-xs opacity-75 mt-1">Sırada {signalQueue.current.length} sinyal daha var</p>
          )}
        </div>
      </div>
    </div>
  );
}
