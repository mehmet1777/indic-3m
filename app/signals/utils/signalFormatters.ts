import { Signal } from '@/types/signal';

export interface SignalDisplayData extends Signal {
  isNew: boolean;
  relativeTime: string;
  formattedPrice: string;
  confidencePercent?: number;
  indicatorName?: string;
}

/**
 * Format timestamp to relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'Az önce';
  } else if (minutes < 60) {
    return `${minutes} dakika önce`;
  } else if (hours < 24) {
    return `${hours} saat önce`;
  } else if (days < 7) {
    return `${days} gün önce`;
  } else {
    // For older signals, return formatted date
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

/**
 * Format price with currency symbol and proper separators
 * Automatically adjusts decimal places based on price magnitude
 * @param price - Numeric price value
 * @returns Formatted price string (e.g., "$1,234.56" or "0.000068")
 */
export function formatPrice(price: number): string {
  // For very small prices (< 0.01), show up to 8 significant decimals
  if (price < 0.01) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  }
  // For small prices (< 1), show up to 6 decimals
  else if (price < 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }
  // For medium prices (< 100), show up to 4 decimals
  else if (price < 100) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  }
  // For large prices, show 2 decimals
  else {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

/**
 * Check if signal is new (less than 5 minutes old)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if signal is less than 5 minutes old
 */
export function isSignalNew(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return (now - timestamp) < fiveMinutes;
}

/**
 * Transform signal to display format with computed properties
 * @param signal - Raw signal data
 * @returns Signal with display-ready properties
 */
export function transformSignalForDisplay(signal: Signal): SignalDisplayData {
  return {
    ...signal,
    isNew: isSignalNew(signal.timestamp),
    relativeTime: formatRelativeTime(signal.timestamp),
    formattedPrice: formatPrice(signal.price),
    confidencePercent: signal.metadata?.confidence 
      ? Math.round(signal.metadata.confidence * 100)
      : undefined,
    indicatorName: signal.metadata?.indicator
  };
}

/**
 * Get active filter count
 * @param searchQuery - Current search query
 * @param signalType - Current signal type filter
 * @returns Number of active filters
 */
export function getActiveFilterCount(
  searchQuery: string,
  signalType: 'ALL' | 'LONG' | 'SHORT' | 'ALERT'
): number {
  let count = 0;
  if (searchQuery.trim()) count++;
  if (signalType !== 'ALL') count++;
  return count;
}
