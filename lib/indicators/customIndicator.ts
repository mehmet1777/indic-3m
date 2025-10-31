import { OHLCVData, IndicatorData, IndicatorLogic } from '@/types';
import { IndicatorSettings } from '@/types/indicator';
import { calculateIndicPro } from './indicPro';

/**
 * İndicPro Combined Indicator
 * Based on Pine Script indicator with full settings support
 */
export const createCustomIndicator = (settings: IndicatorSettings): IndicatorLogic => ({
  calculate(data: OHLCVData[]): IndicatorData[] {
    const result = calculateIndicPro(data, settings);
    return result.main;
  },

  config: {
    name: 'İndicPro Combined',
    type: 'line',
    colors: ['#10b981'], // Green color for main line
  },
});

export const customIndicator: IndicatorLogic = createCustomIndicator({
  channelLength: 10,
  averageLength: 21,
  obLevel1: 60,
  obLevel2: 53,
  osLevel1: -60,
  osLevel2: -53,
  rsiLength: 20,
  calculateDivergence: false,
  channelBandwidth: 8,
  channelMultiplier: 1.5,
  maType: 'WMA',
  maLength: 10,
  bbStdDev: 1,
  showOnChart: false,
});