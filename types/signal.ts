export interface Signal {
  id: string;
  timestamp: number;
  symbol: string;
  signalType: 'LONG' | 'SHORT' | 'ALERT';
  price: number;
  metadata?: Record<string, any>;
  chartImagePath?: string;
  indicatorImagePath?: string;
  folderPath: string;
}

export interface SignalImage {
  id: string;
  signalId: string;
  type: 'chart' | 'indicator';
  path: string;
  timestamp: number;
  symbol: string;
}

export interface SignalFilter {
  symbol?: string;
  signalType?: 'LONG' | 'SHORT' | 'ALERT';
  dateFrom?: number;
  dateTo?: number;
}

export function validateSignal(data: any): data is Signal {
  return (
    typeof data.id === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.symbol === 'string' &&
    ['LONG', 'SHORT', 'ALERT'].includes(data.signalType) &&
    typeof data.price === 'number' &&
    typeof data.folderPath === 'string'
  );
}

export function validateSignalImage(data: any): data is SignalImage {
  return (
    typeof data.id === 'string' &&
    typeof data.signalId === 'string' &&
    ['chart', 'indicator'].includes(data.type) &&
    typeof data.path === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.symbol === 'string'
  );
}
