import { OHLCVData, IndicatorData } from '@/types';
import { IndicatorSettings, MAType } from '@/types/indicator';

// Helper functions for technical analysis
function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaData: number[] = [];
  
  // İlk değer için SMA kullan (TradingView standardı)
  if (data.length === 0) return [];
  
  let emaValue = data[0];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      emaData.push(data[i]);
    } else if (i < period) {
      // İlk period değeri için SMA hesapla
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += data[j];
      }
      emaValue = sum / (i + 1);
      emaData.push(emaValue);
    } else {
      emaValue = data[i] * k + emaValue * (1 - k);
      emaData.push(emaValue);
    }
  }
  return emaData;
}

function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // İlk değerler için mevcut değeri kullan
      result.push(data[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

function rma(data: number[], period: number): number[] {
  const result: number[] = [];
  let rmaValue = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rmaValue = data[i];
    } else {
      rmaValue = (rmaValue * (period - 1) + data[i]) / period;
    }
    result.push(rmaValue);
  }
  return result;
}

function wma(data: number[], period: number): number[] {
  const result: number[] = [];
  const weights = Array.from({ length: period }, (_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]); // İlk değerleri sıfır yerine mevcut değer olarak kullan
    } else {
      let weightedSum = 0;
      for (let j = 0; j < period; j++) {
        // En son değer en yüksek ağırlığa sahip olmalı (TradingView standardı)
        weightedSum += data[i - j] * weights[j];
      }
      result.push(weightedSum / weightSum);
    }
  }
  return result;
}

function vwma(priceData: OHLCVData[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < priceData.length; i++) {
    if (i < period - 1) {
      // İlk değerler için HLC3 kullan
      const price = (priceData[i].high + priceData[i].low + priceData[i].close) / 3;
      result.push(price);
    } else {
      let priceVolumeSum = 0;
      let volumeSum = 0;
      
      for (let j = 0; j < period; j++) {
        const price = (priceData[i - j].high + priceData[i - j].low + priceData[i - j].close) / 3;
        priceVolumeSum += price * priceData[i - j].volume;
        volumeSum += priceData[i - j].volume;
      }
      
      result.push(volumeSum === 0 ? 0 : priceVolumeSum / volumeSum);
    }
  }
  return result;
}

function stdev(data: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(0.1); // Çok küçük bir değer, sıfır bölme hatasını önlemek için
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      const mean = sum / period;
      
      let variance = 0;
      for (let j = 0; j < period; j++) {
        variance += Math.pow(data[i - j] - mean, 2);
      }
      
      result.push(Math.sqrt(variance / period));
    }
  }
  return result;
}

function calculateMA(data: number[], period: number, type: MAType, priceData?: OHLCVData[]): number[] {
  switch (type) {
    case 'SMA':
    case 'SMA + Bollinger Bands':
      return sma(data, period);
    case 'EMA':
      return ema(data, period);
    case 'SMMA (RMA)':
      return rma(data, period);
    case 'WMA':
      return wma(data, period);
    case 'VWMA':
      return priceData ? vwma(priceData, period) : sma(data, period);
    default:
      return data.map(() => 0);
  }
}

export function calculateIndicPro(
  data: OHLCVData[], 
  settings: IndicatorSettings
): {
  main: IndicatorData[];
  signal: IndicatorData[];
  rsi: IndicatorData[];
  ma?: IndicatorData[];
  bbUpper?: IndicatorData[];
  bbLower?: IndicatorData[];
  levels: {
    obLevel1: number;
    obLevel2: number;
    osLevel1: number;
    osLevel2: number;
  };
} {
  const { channelLength, averageLength, rsiLength, maType, maLength, bbStdDev } = settings;
  
  // Calculate HLC3 (average of high, low, close)
  const hlc3 = data.map(d => (d.high + d.low + d.close) / 3);
  
  // Calculate EMA of HLC3
  const esaValues = ema(hlc3, channelLength);
  
  // Calculate absolute difference
  const absDiff = hlc3.map((val, i) => Math.abs(val - esaValues[i]));
  const d = ema(absDiff, channelLength);
  
  // Calculate CI (Commodity Channel Index like)
  const ci = hlc3.map((val, i) => {
    if (d[i] === 0) return 0;
    return (val - esaValues[i]) / (0.015 * d[i]);
  });
  
  // Calculate TCI (EMA of CI) - Main line
  const tci = ema(ci, averageLength);
  
  // Calculate Signal (SMA of TCI)
  const signal = sma(tci, 4);
  
  // Calculate RSI on IndicPro values (TradingView standardı)
  const changes: number[] = [];
  for (let i = 1; i < tci.length; i++) {
    changes.push(tci[i] - tci[i - 1]);
  }
  changes.unshift(0);
  
  const gains = changes.map(c => Math.max(c, 0));
  const losses = changes.map(c => Math.abs(Math.min(c, 0)));
  
  // İlk RSI hesaplaması için SMA kullan, sonrasında RMA
  const avgGains: number[] = [];
  const avgLosses: number[] = [];
  
  for (let i = 0; i < gains.length; i++) {
    if (i < rsiLength) {
      // İlk rsiLength değeri için SMA
      let gainSum = 0;
      let lossSum = 0;
      for (let j = 0; j <= i; j++) {
        gainSum += gains[j];
        lossSum += losses[j];
      }
      avgGains.push(gainSum / (i + 1));
      avgLosses.push(lossSum / (i + 1));
    } else if (i === rsiLength) {
      // rsiLength'inci değer için tam SMA
      let gainSum = 0;
      let lossSum = 0;
      for (let j = i - rsiLength + 1; j <= i; j++) {
        gainSum += gains[j];
        lossSum += losses[j];
      }
      avgGains.push(gainSum / rsiLength);
      avgLosses.push(lossSum / rsiLength);
    } else {
      // Sonrasında RMA (Wilder's smoothing)
      const prevAvgGain = avgGains[i - 1];
      const prevAvgLoss = avgLosses[i - 1];
      avgGains.push((prevAvgGain * (rsiLength - 1) + gains[i]) / rsiLength);
      avgLosses.push((prevAvgLoss * (rsiLength - 1) + losses[i]) / rsiLength);
    }
  }
  
  const rsiValues = avgGains.map((gain, i) => {
    const loss = avgLosses[i];
    if (loss === 0) return gain > 0 ? 100 : 50;
    if (gain === 0) return 0;
    const rs = gain / loss;
    return 100 - (100 / (1 + rs));
  });
  
  // Calculate Moving Average if enabled
  let maValues: number[] = [];
  let bbUpperValues: number[] = [];
  let bbLowerValues: number[] = [];
  
  if (maType !== 'None') {
    // RSI değerlerinin sıfır olmayan kısmını kullan
    const validRsiValues = rsiValues.map((val, i) => val || 50);
    maValues = calculateMA(validRsiValues, maLength, maType, data);
    
    if (maType === 'SMA + Bollinger Bands') {
      // For Bollinger Bands, we need SMA regardless of the selected MA type
      const smaValues = sma(validRsiValues, maLength);
      const stdValues = stdev(validRsiValues, maLength);
      maValues = smaValues; // Use SMA for the middle line
      bbUpperValues = smaValues.map((ma, i) => ma + stdValues[i] * bbStdDev);
      bbLowerValues = smaValues.map((ma, i) => ma - stdValues[i] * bbStdDev);
    }
  }
  
  return {
    main: data.map((d, i) => ({
      time: d.time,
      value: tci[i] || 0,
    })),
    signal: data.map((d, i) => ({
      time: d.time,
      value: signal[i] || 0,
    })),
    rsi: data.map((d, i) => ({
      time: d.time,
      value: rsiValues[i] || 50,
    })),
    ma: maType !== 'None' ? data.map((d, i) => ({
      time: d.time,
      value: maValues[i] || rsiValues[i] || 50,
    })) : undefined,
    bbUpper: maType === 'SMA + Bollinger Bands' ? data.map((d, i) => ({
      time: d.time,
      value: bbUpperValues[i] || (rsiValues[i] || 50) + 10,
    })) : undefined,
    bbLower: maType === 'SMA + Bollinger Bands' ? data.map((d, i) => ({
      time: d.time,
      value: bbLowerValues[i] || (rsiValues[i] || 50) - 10,
    })) : undefined,
    levels: {
      obLevel1: settings.obLevel1,
      obLevel2: settings.obLevel2,
      osLevel1: settings.osLevel1,
      osLevel2: settings.osLevel2,
    }
  };
}