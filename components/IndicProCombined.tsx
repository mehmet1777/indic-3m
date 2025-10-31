'use client';

import { memo, useRef, useEffect, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';
import { OHLCVData, TimeRange } from '@/types';
import { IndicProSettingsPanel, IndicProSettings, defaultIndicProSettings } from './IndicProSettings';



interface IndicProCombinedProps {
    priceData: OHLCVData[];
    timeRange?: TimeRange;
    onTimeRangeChange?: (range: TimeRange) => void;
    autoCapture?: boolean;
}

export interface IndicProCombinedRef {
    takeScreenshot: () => string | undefined;
}

// İndicPro hesaplama fonksiyonu
const calculateIndicPro = (data: OHLCVData[], settings: IndicProSettings) => {
    const { channelLength, averageLength, rsiLength, rsiSource, maType, maLength, bbStdDev } = settings;

    console.log('IndicPro Calculate - Data length:', data.length, 'Required:', Math.max(channelLength, averageLength, rsiLength));
    if (data.length < Math.max(channelLength, averageLength, rsiLength)) {
        console.log('Not enough data, returning empty arrays');
        return { main: [], signal: [], rsi: [], ma: [], bbUpper: [], bbLower: [], signals: [] };
    }

    // İndicPro Main hesaplama
    const main: Array<{ time: number; value: number }> = [];
    const signal: Array<{ time: number; value: number }> = [];
    const rsi: Array<{ time: number; value: number }> = [];
    const ma: Array<{ time: number; value: number }> = [];
    const bbUpper: Array<{ time: number; value: number }> = [];
    const bbLower: Array<{ time: number; value: number }> = [];
    const signals: Array<{ time: number; type: 'long' | 'short'; level: number; value: number }> = [];

    // EMA hesaplama yardımcı fonksiyonu
    const calculateEMA = (values: number[], period: number) => {
        const ema: number[] = [];
        const multiplier = 2 / (period + 1);

        for (let i = 0; i < values.length; i++) {
            if (i === 0) {
                ema[i] = values[i];
            } else {
                ema[i] = (values[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
            }
        }
        return ema;
    };

    // SMA hesaplama
    const calculateSMA = (values: number[], period: number) => {
        const sma: number[] = [];
        for (let i = 0; i < values.length; i++) {
            if (i < period - 1) {
                sma[i] = values[i];
            } else {
                const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma[i] = sum / period;
            }
        }
        return sma;
    };

    // RSI hesaplama
    const calculateRSI = (values: number[], period: number) => {
        const rsiValues: number[] = [];
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < values.length; i++) {
            const change = values[i] - values[i - 1];

            if (i <= period) {
                if (change > 0) gains += change;
                else losses -= change;

                if (i === period) {
                    gains /= period;
                    losses /= period;
                    const rs = gains / losses;
                    rsiValues[i] = 100 - (100 / (1 + rs));
                } else {
                    rsiValues[i] = 50;
                }
            } else {
                const gain = change > 0 ? change : 0;
                const loss = change < 0 ? -change : 0;

                gains = ((gains * (period - 1)) + gain) / period;
                losses = ((losses * (period - 1)) + loss) / period;

                const rs = gains / losses;
                rsiValues[i] = 100 - (100 / (1 + rs));
            }
        }

        return rsiValues;
    };

    // HLC3 hesaplama
    const hlc3Values = data.map(d => (d.high + d.low + d.close) / 3);

    // İndicPro ana hesaplama
    const esa = calculateEMA(hlc3Values, channelLength);
    const d = calculateEMA(hlc3Values.map((val, i) => Math.abs(val - esa[i])), channelLength);
    const ci = hlc3Values.map((val, i) => (val - esa[i]) / (0.015 * d[i]));
    const tci = calculateEMA(ci, averageLength);
    const indicProSignal = calculateSMA(tci, 4);

    // RSI kaynak seçimi
    let rsiSourceValues: number[];
    switch (rsiSource) {
        case 'İndicPro_DT_v1':
            rsiSourceValues = tci;
            break;
        case 'açılış':
            rsiSourceValues = data.map(d => d.open);
            break;
        case 'yüksek':
            rsiSourceValues = data.map(d => d.high);
            break;
        case 'düşük':
            rsiSourceValues = data.map(d => d.low);
            break;
        case 'kapanış':
            rsiSourceValues = data.map(d => d.close);
            break;
        case 'hl2':
            rsiSourceValues = data.map(d => (d.high + d.low) / 2);
            break;
        case 'hlc3':
            rsiSourceValues = hlc3Values;
            break;
        case 'ohlc4':
            rsiSourceValues = data.map(d => (d.open + d.high + d.low + d.close) / 4);
            break;
        default:
            rsiSourceValues = tci;
    }

    // İndicPro RSI hesaplama (seçilen kaynaktan)
    const rsiValues = calculateRSI(rsiSourceValues, rsiLength);
    console.log('RSI Values:', rsiValues.length, 'First few:', rsiValues.slice(0, 5));

    // Moving Average hesaplama
    let maValues: number[] = [];
    if (maType !== 'None') {
        console.log('Calculating MA, Type:', maType, 'Length:', maLength, 'RSI Values:', rsiValues.length);
        switch (maType) {
            case 'SMA':
            case 'SMA + Bollinger Bands':
                maValues = calculateSMA(rsiValues, maLength);
                break;
            case 'EMA':
                maValues = calculateEMA(rsiValues, maLength);
                break;
            default:
                maValues = calculateSMA(rsiValues, maLength);
        }
        console.log('MA Values calculated:', maValues.length);
    }

    // Bollinger Bands hesaplama
    let bbUpperValues: number[] = [];
    let bbLowerValues: number[] = [];
    if (maType === 'SMA + Bollinger Bands') {
        for (let i = 0; i < rsiValues.length; i++) {
            if (i >= maLength - 1) {
                const slice = rsiValues.slice(i - maLength + 1, i + 1);
                const mean = slice.reduce((a, b) => a + b, 0) / maLength;
                const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / maLength;
                const stdDev = Math.sqrt(variance);

                bbUpperValues[i] = maValues[i] + (stdDev * bbStdDev);
                bbLowerValues[i] = maValues[i] - (stdDev * bbStdDev);
            } else {
                bbUpperValues[i] = maValues[i];
                bbLowerValues[i] = maValues[i];
            }
        }
    }

    // Sinyal tespiti
    let saw55 = false;
    let sawPlus55 = false;
    let prevIndicPro = 0;

    console.log('Starting main loop, data length:', data.length, 'TCI length:', tci.length);
    for (let i = 0; i < data.length; i++) {
        if (i < Math.max(channelLength, averageLength)) continue;

        const currentIndicPro = tci[i];
        const time = data[i].time;

        // Ana çizgiler
        main.push({ time, value: currentIndicPro });
        signal.push({ time, value: indicProSignal[i] });

        // RSI
        if (rsiValues[i] !== undefined) {
            rsi.push({ time, value: rsiValues[i] });
        }

        // Moving Average
        if (maType !== 'None' && maValues[i] !== undefined) {
            ma.push({ time, value: maValues[i] });
        }

        // Bollinger Bands
        if (maType === 'SMA + Bollinger Bands') {
            if (bbUpperValues[i] !== undefined) {
                bbUpper.push({ time, value: bbUpperValues[i] });
            }
            if (bbLowerValues[i] !== undefined) {
                bbLower.push({ time, value: bbLowerValues[i] });
            }
        }

        // Sinyal mantığı
        if (currentIndicPro >= -55 && prevIndicPro < -55) {
            saw55 = true;
        }
        if (currentIndicPro <= 55 && prevIndicPro > 55) {
            sawPlus55 = true;
        }

        // Long sinyaller
        const signal65 = currentIndicPro <= -65 && prevIndicPro > -65 && saw55;
        const signal70 = currentIndicPro <= -70 && prevIndicPro > -70;
        const signal80 = currentIndicPro <= -80 && prevIndicPro > -80;

        // Short sinyaller
        const signalPlus65 = currentIndicPro >= 65 && prevIndicPro < 65 && sawPlus55;
        const signalPlus70 = currentIndicPro >= 70 && prevIndicPro < 70;
        const signalPlus80 = currentIndicPro >= 80 && prevIndicPro < 80;

        // Sinyal kaydetme
        if (signal80) {
            signals.push({ time, type: 'long', level: 80, value: -80 });
        } else if (signal70 && !signal80) {
            signals.push({ time, type: 'long', level: 70, value: -70 });
        } else if (signal65 && !signal70 && !signal80) {
            signals.push({ time, type: 'long', level: 65, value: -65 });
        }

        if (signalPlus80) {
            signals.push({ time, type: 'short', level: 80, value: 80 });
        } else if (signalPlus70 && !signalPlus80) {
            signals.push({ time, type: 'short', level: 70, value: 70 });
        } else if (signalPlus65 && !signalPlus70 && !signalPlus80) {
            signals.push({ time, type: 'short', level: 65, value: 65 });
        }

        // Nötr bölge kontrolü
        if (currentIndicPro < 53 && currentIndicPro > -53) {
            saw55 = false;
            sawPlus55 = false;
        }

        prevIndicPro = currentIndicPro;
    }

    console.log('IndicPro Calculate Results:', {
        main: main.length,
        signal: signal.length,
        rsi: rsi.length,
        ma: ma.length,
        bbUpper: bbUpper.length,
        bbLower: bbLower.length,
        signals: signals.length
    });
    return { main, signal, rsi, ma, bbUpper, bbLower, signals };
};

const IndicProCombinedComponent = ({ priceData, timeRange, onTimeRangeChange, autoCapture = false }: IndicProCombinedProps) => {
    console.log('IndicProCombined component rendered, priceData length:', priceData?.length || 0);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const signalSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    const tempSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    const [settings, setSettings] = useState<IndicProSettings>(defaultIndicProSettings);
    const [isCapturing, setIsCapturing] = useState(false);

    // Chart oluşturma
    useEffect(() => {
        console.log('Chart creation useEffect triggered');
        if (!chartContainerRef.current) {
            console.log('Chart container ref not ready');
            return;
        }

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
                mode: 1, // Crosshair açık
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
            rightPriceScale: {
                borderColor: '#1e293b',
                visible: true,
                entireTextOnly: false,
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.2,
                },
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
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        chartRef.current = chart;

        // Ana İndicPro çizgisi (yeşil)
        const mainSeries = chart.addLineSeries({
            color: '#10b981',
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });
        mainSeriesRef.current = mainSeries;

        // İndicPro Signal çizgisi (kırmızı)
        const signalSeries = chart.addLineSeries({
            color: '#ef4444',
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });
        signalSeriesRef.current = signalSeries;

        // RSI çizgisi (kırmızı)
        const rsiSeries = chart.addLineSeries({
            color: '#ef4444',
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
        });
        rsiSeriesRef.current = rsiSeries;

        // Moving Average çizgisi (sarı)
        const maSeries = chart.addLineSeries({
            color: '#f59e0b',
            lineWidth: 2,
            visible: settings.maType !== 'None',
            lastValueVisible: false,
            priceLineVisible: false,
        });
        maSeriesRef.current = maSeries;

        // Bollinger Bands
        const bbUpperSeries = chart.addLineSeries({
            color: '#ef4444', // Kırmızı - Üst band
            lineWidth: 2, // Kalınlaştırıldı
            lineStyle: 2, // Dashed
            visible: settings.maType === 'SMA + Bollinger Bands',
            lastValueVisible: false,
            priceLineVisible: false,
        });
        bbUpperSeriesRef.current = bbUpperSeries;

        const bbLowerSeries = chart.addLineSeries({
            color: '#3b82f6', // Mavi - Alt band
            lineWidth: 2, // Kalınlaştırıldı
            lineStyle: 2, // Dashed
            visible: settings.maType === 'SMA + Bollinger Bands',
            lastValueVisible: false,
            priceLineVisible: false,
        });
        bbLowerSeriesRef.current = bbLowerSeries;





        // Zero Line
        mainSeries.createPriceLine({
            price: 0,
            color: '#6b7280',
            lineWidth: 1,
            axisLabelVisible: true,
            title: 'Zero Line',
        });

        // RSI seviye çizgileri
        rsiSeries.createPriceLine({
            price: 70,
            color: '#ef4444',
            lineWidth: 2, // Kalınlaştırıldı
            lineStyle: 2,
            axisLabelVisible: true,
            title: '',
        });

        rsiSeries.createPriceLine({
            price: 30,
            color: '#10b981',
            lineWidth: 2, // Kalınlaştırıldı
            lineStyle: 2,
            axisLabelVisible: true,
            title: '',
        });



        // Resize handler
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [settings]);

    // Veri güncelleme
    useEffect(() => {
        console.log('Data update effect triggered, priceData length:', priceData.length);
        if (!mainSeriesRef.current || !signalSeriesRef.current || !rsiSeriesRef.current || !priceData.length) {
            console.log('Missing refs or no data:', {
                mainSeries: !!mainSeriesRef.current,
                signalSeries: !!signalSeriesRef.current,
                rsiSeries: !!rsiSeriesRef.current,
                dataLength: priceData.length
            });
            return;
        }

        const indicatorResult = calculateIndicPro(priceData, settings);

        // Ana çizgileri güncelle
        const mainData = indicatorResult.main.map(d => ({
            time: d.time as any,
            value: d.value,
        }));
        mainSeriesRef.current.setData(mainData);

        const signalData = indicatorResult.signal.map(d => ({
            time: d.time as any,
            value: d.value,
        }));
        signalSeriesRef.current.setData(signalData);

        // RSI verilerini güncelle
        const rsiData = indicatorResult.rsi.map(d => ({
            time: d.time as any,
            value: d.value,
        }));
        rsiSeriesRef.current.setData(rsiData);

        // Moving Average güncelle
        if (maSeriesRef.current && settings.maType !== 'None') {
            maSeriesRef.current.applyOptions({ visible: true });
            const maData = indicatorResult.ma.map(d => ({
                time: d.time as any,
                value: d.value,
            }));
            console.log('MA Data:', maData.length, 'MA Type:', settings.maType);
            maSeriesRef.current.setData(maData);
        } else if (maSeriesRef.current) {
            maSeriesRef.current.applyOptions({ visible: false });
            console.log('MA Hidden, Type:', settings.maType);
        }

        // Bollinger Bands güncelle
        if (bbUpperSeriesRef.current && bbLowerSeriesRef.current && settings.maType === 'SMA + Bollinger Bands') {
            bbUpperSeriesRef.current.applyOptions({ visible: true });
            bbLowerSeriesRef.current.applyOptions({ visible: true });

            const bbUpperData = indicatorResult.bbUpper.map(d => ({
                time: d.time as any,
                value: d.value,
            }));
            bbUpperSeriesRef.current.setData(bbUpperData);

            const bbLowerData = indicatorResult.bbLower.map(d => ({
                time: d.time as any,
                value: d.value,
            }));
            bbLowerSeriesRef.current.setData(bbLowerData);



            console.log('BB Data:', bbUpperData.length, bbLowerData.length);
        } else if (bbUpperSeriesRef.current && bbLowerSeriesRef.current) {
            bbUpperSeriesRef.current.applyOptions({ visible: false });
            bbLowerSeriesRef.current.applyOptions({ visible: false });



            console.log('BB Hidden, Type:', settings.maType);
        }

        // Auto capture mode: Add invisible future points and set range
        if (chartRef.current && autoCapture && priceData.length > 0) {
            const lastDataPoint = priceData[priceData.length - 1];
            const tenHoursAgo = lastDataPoint.time - (10 * 60 * 60);
            const futureTime = 180 * 60; // 3 hours
            
            // Add invisible future points to force the chart to show future space
            if (tempSeriesRef.current && chartRef.current) {
                try {
                    chartRef.current.removeSeries(tempSeriesRef.current);
                } catch (e) {
                    // Series might already be removed
                }
                tempSeriesRef.current = null;
            }
            
            if (chartRef.current) {
                tempSeriesRef.current = chartRef.current.addLineSeries({
                    color: 'transparent',
                    lineWidth: 1,
                    visible: false,
                });
                
                const futurePoints = [
                    { time: (lastDataPoint.time + 300) as any, value: 0 },
                    { time: (lastDataPoint.time + 10800) as any, value: 0 }, // 3 hours
                ];
                tempSeriesRef.current.setData(futurePoints);
            }
            
            // Set visible range after adding future points
            setTimeout(() => {
                if (chartRef.current) {
                    chartRef.current.timeScale().setVisibleRange({
                        from: tenHoursAgo as any,
                        to: (lastDataPoint.time + futureTime) as any,
                    });
                }
            }, 100);
        } else {
            // Clean up temp series if not in autoCapture mode
            if (tempSeriesRef.current && chartRef.current) {
                try {
                    chartRef.current.removeSeries(tempSeriesRef.current);
                } catch (e) {
                    // Series might already be removed
                }
                tempSeriesRef.current = null;
            }
        }

    }, [priceData, settings, autoCapture]);

    // Screenshot alma fonksiyonu
    const handleScreenshot = async () => {
        if (!chartRef.current || !chartContainerRef.current || isCapturing) return;

        setIsCapturing(true);

        try {
            const timeScale = chartRef.current.timeScale();
            const originalRange = timeScale.getVisibleRange();

            // 6 saatlik görünüm ayarla + 2 saat gelecek
            const lastDataPoint = priceData[priceData.length - 1];
            const sixHoursAgo = lastDataPoint.time - (6 * 60 * 60);
            const futureTime = 120 * 60; // 2 saat gelecek

            // Gelecek alanı için geçici seri
            if (chartRef.current) {
                tempSeriesRef.current = chartRef.current.addLineSeries({
                    color: 'transparent',
                    lineWidth: 1,
                    visible: false,
                });

                const futurePoints = [
                    { time: (lastDataPoint.time + 300) as any, value: 0 },
                    { time: (lastDataPoint.time + 7200) as any, value: 0 },
                ];
                tempSeriesRef.current.setData(futurePoints);
            }

            // Zaman aralığını ayarla
            setTimeout(() => {
                timeScale.setVisibleRange({
                    from: sixHoursAgo as any,
                    to: (lastDataPoint.time + futureTime) as any,
                });
            }, 100);

            // Render bekle
            await new Promise(resolve => setTimeout(resolve, 800));

            // Screenshot al
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(chartContainerRef.current, {
                useCORS: true,
                background: '#0a0e27',
            });

            // Orijinal görünüme dön
            if (originalRange) {
                timeScale.setVisibleRange({
                    from: originalRange.from as any,
                    to: originalRange.to as any,
                });
            } else {
                timeScale.fitContent();
            }

            // Geçici seriyi temizle
            if (tempSeriesRef.current && chartRef.current) {
                chartRef.current.removeSeries(tempSeriesRef.current);
                tempSeriesRef.current = null;
            }

            // İndir
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    const now = new Date();
                    const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
                    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
                    link.download = `IndicPro_Combined_6h_${dateStr}_${timeStr}.png`;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');

        } catch (error) {
            console.error('Screenshot alınırken hata:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">İndicPro Combined</h3>
                    <p className="text-sm text-text-muted mt-1">İndicPro Main + Signal + RSI with Moving Average</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            <span className="text-text-secondary">İndicPro Main</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            <span className="text-text-secondary">İndicPro Signal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            <span className="text-text-secondary">RSI</span>
                        </div>
                        {settings.maType !== 'None' && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-0.5 bg-yellow-500"></div>
                                <span className="text-text-secondary">MA ({settings.maType})</span>
                            </div>
                        )}
                        {settings.maType === 'SMA + Bollinger Bands' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-red-500"></div>
                                    <span className="text-text-secondary">BB Upper</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-0.5 bg-blue-500"></div>
                                    <span className="text-text-secondary">BB Lower</span>
                                </div>
                            </>
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
                        <IndicProSettingsPanel
                            settings={settings}
                            onSettingsChange={setSettings}
                        />
                    </div>
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
        </div>
    );
};

export const IndicProCombined = memo(IndicProCombinedComponent);