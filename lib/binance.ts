import { OHLCVData, BinanceKline } from '@/types';

export class BinanceAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'BinanceAPIError';
  }
}

export class BinanceAPI {
  private baseUrl = 'https://api.binance.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  /**
   * Fetch OHLCV (candlestick) data for a symbol
   */
  async getKlines(
    symbol: string,
    interval: string = '1h',
    limit: number = 500
  ): Promise<OHLCVData[]> {
    const cacheKey = `klines_${symbol}_${interval}_${limit}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const url = `${this.baseUrl}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;

    try {
      const response = await this.fetchWithRetry(url);
      const data: BinanceKline[] = await response.json();
      const transformed = data.map(this.transformKlineData);

      // Cache the result
      this.cache.set(cacheKey, { data: transformed, timestamp: Date.now() });

      return transformed;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch chart data');
    }
  }

  /**
   * Search for symbols matching a query
   */
  async searchSymbol(query: string): Promise<string[]> {
    const cacheKey = 'exchangeInfo';

    let exchangeInfo;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      exchangeInfo = cached.data;
    } else {
      const url = `${this.baseUrl}/exchangeInfo`;

      try {
        const response = await this.fetchWithRetry(url);
        exchangeInfo = await response.json();
        this.cache.set(cacheKey, { data: exchangeInfo, timestamp: Date.now() });
      } catch (error) {
        throw this.handleError(error, 'Failed to search symbols');
      }
    }

    const queryUpper = query.toUpperCase();
    const symbols = exchangeInfo.symbols
      .filter((s: any) => s.status === 'TRADING')
      .map((s: any) => s.symbol)
      .filter((symbol: string) => symbol.includes(queryUpper))
      .slice(0, 10); // Limit to 10 results

    console.log(`Search results for "${queryUpper}":`, symbols);
    return symbols;
  }

  /**
   * Validate if a symbol exists and is trading
   */
  async validateSymbol(symbol: string): Promise<boolean> {
    try {
      const cacheKey = 'exchangeInfo';

      let exchangeInfo;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        exchangeInfo = cached.data;
      } else {
        const url = `${this.baseUrl}/exchangeInfo`;
        const response = await this.fetchWithRetry(url);
        exchangeInfo = await response.json();
        this.cache.set(cacheKey, { data: exchangeInfo, timestamp: Date.now() });
      }

      // Tam eşleşme kontrolü (daha doğru)
      const symbolUpper = symbol.toUpperCase();
      const exists = exchangeInfo.symbols.some((s: any) =>
        s.symbol === symbolUpper && s.status === 'TRADING'
      );

      console.log(`Symbol validation: ${symbolUpper} = ${exists}`);
      return exists;
    } catch (error) {
      console.error('Symbol validation error:', error);
      return false;
    }
  }

  /**
   * Transform Binance kline data to OHLCVData format
   */
  private transformKlineData(kline: BinanceKline): OHLCVData {
    return {
      time: Math.floor(kline[0] / 1000), // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5])
    };
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry(url: string, attempt: number = 1): Promise<Response> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          return this.fetchWithRetry(url, attempt + 1);
        }
        throw new BinanceAPIError(
          'Too many requests. Please wait a moment.',
          'RATE_LIMIT',
          429
        );
      }

      // Handle other errors
      if (!response.ok) {
        if (response.status === 400) {
          throw new BinanceAPIError(
            'Coin not found. Please try another symbol.',
            'INVALID_SYMBOL',
            400
          );
        }
        throw new BinanceAPIError(
          `API error: ${response.statusText}`,
          'API_ERROR',
          response.status
        );
      }

      return response;
    } catch (error) {
      // Network errors - retry with exponential backoff
      if (error instanceof TypeError && attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown, defaultMessage: string): BinanceAPIError {
    if (error instanceof BinanceAPIError) {
      return error;
    }

    if (error instanceof TypeError) {
      return new BinanceAPIError(
        'Unable to connect. Please check your internet connection.',
        'NETWORK_ERROR'
      );
    }

    return new BinanceAPIError(defaultMessage, 'UNKNOWN_ERROR');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current ticker price for multiple symbols with volume
   */
  async getTickerPrices(symbols: string[]): Promise<Map<string, { price: number; change: number; volume: number }>> {
    const url = `${this.baseUrl}/ticker/24hr`;

    try {
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      const priceMap = new Map<string, { price: number; change: number; volume: number }>();

      symbols.forEach(symbol => {
        const ticker = data.find((t: any) => t.symbol === symbol.toUpperCase());
        if (ticker) {
          priceMap.set(symbol, {
            price: parseFloat(ticker.lastPrice),
            change: parseFloat(ticker.priceChangePercent),
            volume: parseFloat(ticker.quoteVolume) // Volume in USDT
          });
        }
      });

      return priceMap;
    } catch (error) {
      console.error('Failed to fetch ticker prices:', error);
      return new Map();
    }
  }

  /**
   * Get total market statistics from Binance (real-time)
   */
  async getMarketStats(): Promise<{ totalVolume: number; btcDominance: number; totalMarketCap: number }> {
    try {
      const url = `${this.baseUrl}/ticker/24hr`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();

      // Calculate total USDT volume from Binance
      let totalVolume = 0;
      data.forEach((ticker: any) => {
        if (ticker.symbol.endsWith('USDT')) {
          totalVolume += parseFloat(ticker.quoteVolume);
        }
      });

      // Get BTC data
      const btcTicker = data.find((t: any) => t.symbol === 'BTCUSDT');
      const btcPrice = btcTicker ? parseFloat(btcTicker.lastPrice) : 67000;
      const btcVolume = btcTicker ? parseFloat(btcTicker.quoteVolume) : 0;

      // Calculate BTC market cap (approximate)
      const btcSupply = 19600000; // Approximate circulating supply
      const btcMarketCap = btcPrice * btcSupply;

      // Estimate total market cap (BTC dominance ~59.8%)
      const btcDominance = 59.8;
      const totalMarketCap = btcMarketCap / (btcDominance / 100);

      console.log('Binance market stats:', {
        totalVolume: (totalVolume / 1e9).toFixed(2) + 'B',
        btcPrice: btcPrice.toFixed(2),
        btcMarketCap: (btcMarketCap / 1e12).toFixed(2) + 'T',
        totalMarketCap: (totalMarketCap / 1e12).toFixed(2) + 'T'
      });

      return {
        totalVolume: totalVolume / 1e9, // Convert to billions
        btcDominance,
        totalMarketCap: totalMarketCap / 1e12 // Convert to trillions
      };
    } catch (error) {
      console.error('Failed to fetch market stats from Binance:', error);
      return {
        totalVolume: 150.0,
        btcDominance: 59.8,
        totalMarketCap: 2.5
      };
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const binanceAPI = new BinanceAPI();
