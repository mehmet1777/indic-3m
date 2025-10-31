'use client';

import { useEffect, useRef, memo } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { OHLCVData, TimeRange } from '@/types';

interface ChartProps {
  data: OHLCVData[];
  symbol: string;
  onTimeRangeChange?: (range: TimeRange) => void;
}

const ChartComponent = ({ data, symbol, onTimeRangeChange }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0e27' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: any) => {
          // Yerel saat dilimini kullan (Türkiye'de otomatik UTC+3)
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${day}/${month} ${hours}:${minutes}`;
        },
      },
      localization: {
        timeFormatter: (time: any) => {
          // Crosshair için yerel saat dilimini kullan
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: window.innerWidth < 768 ? 400 : 600,
    });

    chartRef.current = chart;

    // Add candlestick series (v4 API)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    const candlestickData = data.map(d => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeriesRef.current.setData(candlestickData);

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  // Subscribe to time range changes
  useEffect(() => {
    if (!chartRef.current || !onTimeRangeChange) return;

    const timeScale = chartRef.current.timeScale();
    
    const handleVisibleTimeRangeChange = () => {
      const range = timeScale.getVisibleRange();
      if (range) {
        onTimeRangeChange({
          from: range.from as number,
          to: range.to as number,
        });
      }
    };

    timeScale.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);

    return () => {
      timeScale.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
    };
  }, [onTimeRangeChange]);

  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleRange();
    if (range) {
      const diff = (range.to as number) - (range.from as number);
      const newDiff = diff * 0.7;
      const center = ((range.from as number) + (range.to as number)) / 2;
      timeScale.setVisibleRange({
        from: (center - newDiff / 2) as any,
        to: (center + newDiff / 2) as any,
      });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleRange();
    if (range) {
      const diff = (range.to as number) - (range.from as number);
      const newDiff = diff * 1.3;
      const center = ((range.from as number) + (range.to as number)) / 2;
      timeScale.setVisibleRange({
        from: (center - newDiff / 2) as any,
        to: (center + newDiff / 2) as any,
      });
    }
  };

  const handleResetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Price Chart</h2>
          <p className="text-sm text-text-muted mt-1">Candlestick chart</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
    </div>
  );
};

export const Chart = memo(ChartComponent);
