// Data Models

export interface OHLCVData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  time: number;
  value: number;
  color?: string; // Optional for multi-color indicators
}

export type BinanceKline = [
  number,  // Open time
  string,  // Open
  string,  // High
  string,  // Low
  string,  // Close
  string,  // Volume
  number,  // Close time
  string,  // Quote asset volume
  number,  // Number of trades
  string,  // Taker buy base asset volume
  string,  // Taker buy quote asset volume
  string   // Ignore
];

export interface TimeRange {
  from: number;
  to: number;
}

export interface IndicatorLogic {
  calculate(data: OHLCVData[]): IndicatorData[];
  config: {
    name: string;
    type: 'line' | 'histogram' | 'area';
    colors: string[];
  };
}
