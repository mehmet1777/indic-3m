'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
import { OHLCVData, TimeRange, IndicatorLogic } from '@/types';
import { IndicatorSettings } from '@/types/indicator';
import { IndicatorSettingsPanel } from './IndicatorSettings';
import { calculateIndicPro } from '@/lib/indicators/indicPro';

interface CustomIndicatorProps {
  priceData: OHLCVData[];
  timeRange?: TimeRange;
  indicator: IndicatorLogic;
  indicatorSettings: IndicatorSettings;
  onSettingsChange: (settings: IndicatorSettings) => void;
  onTimeRangeChange?: (range: TimeRange) => void;
  autoCapture?: boolean;
}

const CustomIndicatorComponent = ({
  priceData,
  timeRange,
  indicator,
  indicatorSettings,
  onSettingsChange,
  onTimeRangeChange,
  autoCapture = false
}: CustomIndicatorProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | ISeriesApi<'Histogram'> | null>(null);
  const signalSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const tempSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !rsiChartContainerRef.current) return;

    const baseChartOptions = {
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
    };

    // Create main indicator chart (TCI) - zaman çizelgesi kapalı
    const chart = createChart(chartContainerRef.current, {
      ...baseChartOptions,
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        visible: false, // Üst chart'ta zaman çizelgesi kapalı
      },
      height: window.innerWidth < 768 ? 200 : 250,
    });
    chartRef.current = chart;

    // Create RSI chart - zaman çizelgesi açık
    const rsiChart = createChart(rsiChartContainerRef.current, {
      ...baseChartOptions,
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        visible: true, // Alt chart'ta zaman çizelgesi açık
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
      rightPriceScale: {
        borderColor: '#1e293b',
        visible: true,
        entireTextOnly: true, // Sadece tam sayıları göster
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
      },
      height: window.innerWidth < 768 ? 300 : 400, // Tek chart olduğu için daha büyük
    });
    rsiChartRef.current = rsiChart;

    // Add main TCI series
    if (indicator.config.type === 'line') {
      const lineSeries = chart.addLineSeries({
        color: indicator.config.colors[0] || '#10b981',
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;

      // Add signal line (red)
      const signalSeries = chart.addLineSeries({
        color: '#ef4444',
        lineWidth: 2,
      });
      signalSeriesRef.current = signalSeries;
    } else if (indicator.config.type === 'histogram') {
      const histogramSeries = chart.addHistogramSeries({
        color: indicator.config.colors[0] || '#22d3ee',
      });
      lineSeriesRef.current = histogramSeries;
    }

    // Add RSI series
    const rsiSeries = rsiChart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2,
      lastValueVisible: false, // Sağdaki mor noktalı çizgiyi kaldır
      priceLineVisible: false, // Price line'ı tamamen kapat
    });
    rsiSeriesRef.current = rsiSeries;

    // Add Moving Average series (will be shown/hidden based on settings)
    const maSeries = rsiChart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      visible: indicatorSettings.maType !== 'None',
      lastValueVisible: false, // Sağdaki sarı noktalı çizgiyi kaldır
      priceLineVisible: false, // Price line'ı tamamen kapat
    });
    maSeriesRef.current = maSeries;

    // Add Bollinger Bands series (will be shown/hidden based on settings)
    const bbUpperSeries = rsiChart.addLineSeries({
      color: '#6b7280',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      visible: indicatorSettings.maType === 'SMA + Bollinger Bands',
    });
    bbUpperSeriesRef.current = bbUpperSeries;

    const bbLowerSeries = rsiChart.addLineSeries({
      color: '#6b7280',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      visible: indicatorSettings.maType === 'SMA + Bollinger Bands',
    });
    bbLowerSeriesRef.current = bbLowerSeries;

    // RSI seviye çizgileri ekle
    // Alt seviye çizgisi - 27 (Yeşil)
    rsiSeries.createPriceLine({
      price: 27,
      color: '#10b981', // Yeşil
      lineWidth: 2, // Kalınlaştırıldı
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: '',
    });

    // Üst seviye çizgisi - 77 (Kırmızı)
    rsiSeries.createPriceLine({
      price: 77,
      color: '#ef4444', // Kırmızı
      lineWidth: 2, // Kalınlaştırıldı
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: '',
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
      if (rsiChartContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({
          width: rsiChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      rsiChart.remove();
    };
  }, [indicator, indicatorSettings.maType]);

  // Update indicator data
  useEffect(() => {
    if (!lineSeriesRef.current || !rsiSeriesRef.current || !priceData.length) return;

    // Calculate all indicator data using the updated function
    const indicatorResult = calculateIndicPro(priceData, indicatorSettings);

    // Set main TCI line data
    const lineData = indicatorResult.main.map(d => ({
      time: d.time as any,
      value: d.value,
    }));
    lineSeriesRef.current.setData(lineData);

    // Set signal line data
    if (signalSeriesRef.current) {
      const signalData = indicatorResult.signal.map(d => ({
        time: d.time as any,
        value: d.value,
      }));
      signalSeriesRef.current.setData(signalData);
    }

    // Set RSI data
    const rsiData = indicatorResult.rsi.map(d => ({
      time: d.time as any,
      value: d.value,
    }));
    rsiSeriesRef.current.setData(rsiData);

    // Set Moving Average data if enabled
    if (maSeriesRef.current && indicatorResult.ma && indicatorSettings.maType !== 'None') {
      const maData = indicatorResult.ma.map(d => ({
        time: d.time as any,
        value: d.value,
      }));
      maSeriesRef.current.setData(maData);
      maSeriesRef.current.applyOptions({ visible: true });
    } else if (maSeriesRef.current) {
      maSeriesRef.current.applyOptions({ visible: false });
    }

    // Set Bollinger Bands data if enabled
    if (bbUpperSeriesRef.current && bbLowerSeriesRef.current &&
      indicatorResult.bbUpper && indicatorResult.bbLower &&
      indicatorSettings.maType === 'SMA + Bollinger Bands') {

      const bbUpperData = indicatorResult.bbUpper.map(d => ({
        time: d.time as any,
        value: d.value,
      }));
      const bbLowerData = indicatorResult.bbLower.map(d => ({
        time: d.time as any,
        value: d.value,
      }));

      bbUpperSeriesRef.current.setData(bbUpperData);
      bbLowerSeriesRef.current.setData(bbLowerData);
      bbUpperSeriesRef.current.applyOptions({ visible: true });
      bbLowerSeriesRef.current.applyOptions({ visible: true });
    } else if (bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
      bbUpperSeriesRef.current.applyOptions({ visible: false });
      bbLowerSeriesRef.current.applyOptions({ visible: false });
    }

    // Fit content for RSI chart (sadece RSI chart kullanılıyor)
    if (rsiChartRef.current) {
      if (autoCapture && priceData.length > 0) {
        // Auto capture mode: Add invisible future points and set range
        const lastDataPoint = priceData[priceData.length - 1];
        const tenHoursAgo = lastDataPoint.time - (10 * 60 * 60);
        const futureTime = 180 * 60; // 3 hours
        
        // Add invisible future points to force the chart to show future space
        if (tempSeriesRef.current && rsiChartRef.current) {
          try {
            rsiChartRef.current.removeSeries(tempSeriesRef.current);
          } catch (e) {
            // Series might already be removed
          }
          tempSeriesRef.current = null;
        }
        
        if (rsiChartRef.current) {
          tempSeriesRef.current = rsiChartRef.current.addLineSeries({
            color: 'transparent',
            lineWidth: 1,
            visible: false,
          });
          
          const futurePoints = [
            { time: (lastDataPoint.time + 300) as any, value: 50 },
            { time: (lastDataPoint.time + 10800) as any, value: 50 }, // 3 hours
          ];
          tempSeriesRef.current.setData(futurePoints);
        }
        
        // Set visible range after adding future points
        setTimeout(() => {
          if (rsiChartRef.current) {
            rsiChartRef.current.timeScale().setVisibleRange({
              from: tenHoursAgo as any,
              to: (lastDataPoint.time + futureTime) as any,
            });
          }
        }, 100);
      } else {
        // Clean up temp series if not in autoCapture mode
        if (tempSeriesRef.current && rsiChartRef.current) {
          try {
            rsiChartRef.current.removeSeries(tempSeriesRef.current);
          } catch (e) {
            // Series might already be removed
          }
          tempSeriesRef.current = null;
        }
        if (rsiChartRef.current) {
          rsiChartRef.current.timeScale().fitContent();
        }
      }
    }
  }, [priceData, indicator, indicatorSettings, autoCapture]);

  // Sync time range with main chart - sadece RSI chart
  useEffect(() => {
    if (!rsiChartRef.current || !timeRange) return;

    const rsiTimeScale = rsiChartRef.current.timeScale();

    rsiTimeScale.setVisibleRange({
      from: timeRange.from as any,
      to: timeRange.to as any,
    });
  }, [timeRange]);

  // Subscribe to time range changes - sadece RSI chart
  useEffect(() => {
    if (!rsiChartRef.current || !onTimeRangeChange) return;

    const rsiTimeScale = rsiChartRef.current.timeScale();

    const handleVisibleTimeRangeChange = () => {
      const range = rsiTimeScale.getVisibleRange();
      if (range) {
        onTimeRangeChange({
          from: range.from as number,
          to: range.to as number,
        });
      }
    };

    rsiTimeScale.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);

    return () => {
      rsiTimeScale.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
    };
  }, [onTimeRangeChange]);

  // Screenshot fonksiyonu - Sola kaydırarak daha geniş görünüm
  const handleScreenshot = async () => {
    if (!rsiChartContainerRef.current || !rsiChartRef.current || !priceData.length) return;

    setIsCapturing(true);

    try {
      const rsiTimeScale = rsiChartRef.current.timeScale();

      // Mevcut görünür aralığı kaydet
      const originalRange = rsiTimeScale.getVisibleRange();

      // Son 6 saatlik aralığı hesapla + 2 saat gelecek
      const lastDataPoint = priceData[priceData.length - 1];
      const sixHoursAgo = lastDataPoint.time - (6 * 60 * 60); // 6 saat = 21600 saniye
      const futureTime = 120 * 60; // 2 saat gelecek için boş alan

      // Önce verileri güncelle, sonra zaman aralığını ayarla

      // Y ekseni 0-100 tam aralığını göstermek için geçici veri ekle
      if (rsiSeriesRef.current) {
        // Mevcut RSI verilerini al
        const indicatorResult = calculateIndicPro(priceData, indicatorSettings);
        const currentRsiData = indicatorResult.rsi.map(d => ({
          time: d.time as any,
          value: d.value,
        }));

        // Sadece Y ekseni 0-100 görmek için geçici değerler ekle (çizgiyi uzatmadan)
        const firstDataTime = priceData[0].time;
        const extendedData = [
          { time: (firstDataTime - 120) as any, value: 0 },   // En başa 0 değeri (Y ekseni için)
          { time: (firstDataTime - 60) as any, value: 100 },  // En başa 100 değeri (Y ekseni için)
          ...currentRsiData,
          // Gelecek alanı için sadece görünmez noktalar (çizgiyi uzatmamak için)
        ];

        rsiSeriesRef.current.setData(extendedData);

        // Gelecek alanını zorlamak için geçici görünmez seri ekle
        tempSeriesRef.current = rsiChartRef.current.addLineSeries({
          color: 'transparent', // Görünmez
          lineWidth: 1,
          visible: false,
        });

        // Gelecek noktalarını görünmez seride ekle
        const futurePoints = [
          { time: (lastDataPoint.time + 300) as any, value: 50 },    // 5 dk sonra
          { time: (lastDataPoint.time + 900) as any, value: 50 },    // 15 dk sonra
          { time: (lastDataPoint.time + 1800) as any, value: 50 },   // 30 dk sonra
          { time: (lastDataPoint.time + 3600) as any, value: 50 },   // 1 saat sonra
          { time: (lastDataPoint.time + 5400) as any, value: 50 },   // 1.5 saat sonra
          { time: (lastDataPoint.time + 7200) as any, value: 50 },   // 2 saat sonra
        ];

        tempSeriesRef.current.setData(futurePoints);

        // MA verilerini de güncelle (eğer aktifse)
        if (maSeriesRef.current && indicatorResult.ma && indicatorSettings.maType !== 'None') {
          const currentMaData = indicatorResult.ma.map(d => ({
            time: d.time as any,
            value: d.value,
          }));
          maSeriesRef.current.setData(currentMaData);
        }
      }

      // Veri güncellemesinden sonra zaman aralığını zorla ayarla
      setTimeout(() => {
        rsiTimeScale.setVisibleRange({
          from: sixHoursAgo as any,
          to: (lastDataPoint.time + futureTime) as any, // Sağ tarafta 2 saat boş alan
        });
      }, 100);

      // Chart'ın render olması için bekleme
      await new Promise(resolve => setTimeout(resolve, 800));

      // HTML2Canvas dinamik import
      const html2canvas = (await import('html2canvas')).default;

      // Chart container'ın screenshot'ını al
      const canvas = await html2canvas(rsiChartContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        width: rsiChartContainerRef.current.offsetWidth,
        height: rsiChartContainerRef.current.offsetHeight,
      });

      // Orijinal zoom seviyesine geri dön ve orijinal verileri yükle
      if (originalRange) {
        rsiTimeScale.setVisibleRange({
          from: originalRange.from as any,
          to: originalRange.to as any,
        });
      } else {
        rsiTimeScale.fitContent();
      }

      // Geçici seriyi temizle
      if (tempSeriesRef.current && rsiChartRef.current) {
        rsiChartRef.current.removeSeries(tempSeriesRef.current);
        tempSeriesRef.current = null;
      }

      // Orijinal RSI verilerini geri yükle (geçici 0-100 değerlerini kaldır)
      if (rsiSeriesRef.current) {
        const indicatorResult = calculateIndicPro(priceData, indicatorSettings);
        const originalRsiData = indicatorResult.rsi.map(d => ({
          time: d.time as any,
          value: d.value,
        }));
        rsiSeriesRef.current.setData(originalRsiData);

        // MA verilerini de orijinal haline getir
        if (maSeriesRef.current && indicatorResult.ma && indicatorSettings.maType !== 'None') {
          const originalMaData = indicatorResult.ma.map(d => ({
            time: d.time as any,
            value: d.value,
          }));
          maSeriesRef.current.setData(originalMaData);
        }
      }

      // Canvas'ı blob'a çevir ve indir
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Dosya adı: IndicPro_RSI_Future_TARIH_SAAT.png
          const now = new Date();
          const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
          const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
          link.download = `IndicPro_RSI_6h_Future_${dateStr}_${timeStr}.png`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Screenshot alınırken hata:', error);

      // Hata durumunda da geçici seriyi temizle ve orijinal duruma dön
      if (tempSeriesRef.current && rsiChartRef.current) {
        rsiChartRef.current.removeSeries(tempSeriesRef.current);
        tempSeriesRef.current = null;
      }

      if (rsiChartRef.current) {
        rsiChartRef.current.timeScale().fitContent();

        // Orijinal verileri geri yükle
        if (rsiSeriesRef.current) {
          const indicatorResult = calculateIndicPro(priceData, indicatorSettings);
          const originalRsiData = indicatorResult.rsi.map(d => ({
            time: d.time as any,
            value: d.value,
          }));
          rsiSeriesRef.current.setData(originalRsiData);
        }
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">{indicator.config.name}</h3>
          <p className="text-sm text-text-muted mt-1">İndicPro RSI with Moving Average</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple-500"></div>
              <span className="text-text-secondary">RSI</span>
            </div>
            {indicatorSettings.maType !== 'None' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500"></div>
                <span className="text-text-secondary">MA ({indicatorSettings.maType})</span>
              </div>
            )}
            {indicatorSettings.maType === 'SMA + Bollinger Bands' && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gray-500"></div>
                <span className="text-text-secondary">BB</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScreenshot}
              disabled={isCapturing}
              className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="6 Saat + 2 Saat Gelecek Alanı ile Görüntü Al"
            >
              {isCapturing ? (
                <svg className="w-5 h-5 text-text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <IndicatorSettingsPanel
              settings={indicatorSettings}
              onSettingsChange={onSettingsChange}
            />
          </div>
        </div>
      </div>

      {/* Sadece RSI Chart - TCI paneli gizlendi */}
      <div ref={rsiChartContainerRef} className="w-full rounded-xl overflow-hidden" />

      {/* TCI Chart gizli - görünmez div */}
      <div ref={chartContainerRef} className="hidden" />
    </div>
  );
};

export const CustomIndicator = memo(CustomIndicatorComponent);
