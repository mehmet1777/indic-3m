export type MAType = 'None' | 'SMA' | 'SMA + Bollinger Bands' | 'EMA' | 'SMMA (RMA)' | 'WMA' | 'VWMA';

export interface IndicatorSettings {
  // İndicPro Settings
  channelLength: number;
  averageLength: number;
  obLevel1: number;
  obLevel2: number;
  osLevel1: number;
  osLevel2: number;
  
  // İndicPro RSI Settings
  rsiLength: number;
  calculateDivergence: boolean;
  
  // İndicPro Channel Settings
  channelBandwidth: number;
  channelMultiplier: number;
  
  // İndicPro Moving Average
  maType: MAType;
  maLength: number;
  bbStdDev: number;
  
  // Display Settings
  showOnChart: boolean;
}

export const defaultIndicatorSettings: IndicatorSettings = {
  channelLength: 15,  // TradingView'e en yakın değer
  averageLength: 21,
  obLevel1: 60,
  obLevel2: 53,
  osLevel1: -60,
  osLevel2: -53,
  rsiLength: 18,  // TradingView'e en yakın değer
  calculateDivergence: false,
  channelBandwidth: 8,
  channelMultiplier: 1.5,
  maType: 'WMA',
  maLength: 5,    // TradingView'e en yakın değer
  bbStdDev: 1,
  showOnChart: false,
};
