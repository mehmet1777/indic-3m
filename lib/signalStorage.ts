import { Signal, SignalFilter } from '@/types/signal';
import { put, list, del } from '@vercel/blob';

// In-memory cache for faster access
const signalsCache: Signal[] = [];

export class SignalStorage {
  async saveSignal(signal: Signal): Promise<void> {
    const signalData = {
      ...signal,
      folderPath: `/signals/${signal.id}`,
    };
    
    try {
      // Save to Vercel Blob
      const blob = await put(`signals/${signal.id}.json`, JSON.stringify(signalData), {
        access: 'public',
        addRandomSuffix: false,
      });
      
      console.log('Signal saved to Vercel Blob:', blob.url);
    } catch (error) {
      console.error('Error saving to Vercel Blob:', error);
    }
    
    // Update cache
    const existingIndex = signalsCache.findIndex(s => s.id === signal.id);
    if (existingIndex !== -1) {
      signalsCache[existingIndex] = signalData;
    } else {
      signalsCache.push(signalData);
    }
    
    // Keep only last 100 signals in cache
    if (signalsCache.length > 100) {
      signalsCache.sort((a, b) => b.timestamp - a.timestamp);
      signalsCache.splice(100);
    }
  }

  async getSignal(signalId: string): Promise<Signal | null> {
    // Check cache first
    const cached = signalsCache.find(s => s.id === signalId);
    if (cached) return cached;
    
    // Try to fetch from Vercel Blob
    try {
      const response = await fetch(`https://blob.vercel-storage.com/signals/${signalId}.json`);
      if (response.ok) {
        const signal = await response.json();
        return signal;
      }
    } catch (error) {
      console.error('Error fetching signal from Vercel Blob:', error);
    }
    
    return null;
  }

  async getAllSignals(): Promise<Signal[]> {
    // If cache is empty, try to load from Vercel Blob
    if (signalsCache.length === 0) {
      try {
        const { blobs } = await list({ prefix: 'signals/' });
        
        for (const blob of blobs) {
          try {
            const response = await fetch(blob.url);
            const signal = await response.json();
            signalsCache.push(signal);
          } catch (error) {
            console.error('Error loading signal:', error);
          }
        }
      } catch (error) {
        console.error('Error listing signals from Vercel Blob:', error);
      }
    }
    
    return [...signalsCache].sort((a, b) => b.timestamp - a.timestamp);
  }

  async filterSignals(filter: SignalFilter): Promise<Signal[]> {
    const allSignals = await this.getAllSignals();
    
    return allSignals.filter(signal => {
      if (filter.symbol && signal.symbol !== filter.symbol) return false;
      if (filter.signalType && signal.signalType !== filter.signalType) return false;
      if (filter.dateFrom && signal.timestamp < filter.dateFrom) return false;
      if (filter.dateTo && signal.timestamp > filter.dateTo) return false;
      return true;
    });
  }

  async updateSignalMetadata(signalId: string, updates: Partial<Signal>): Promise<void> {
    const signal = await this.getSignal(signalId);
    if (!signal) throw new Error('Signal not found');
    
    const updatedSignal = { ...signal, ...updates };
    await this.saveSignal(updatedSignal);
  }

  async deleteSignal(signalId: string): Promise<void> {
    try {
      await del(`signals/${signalId}.json`);
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error);
    }
    
    const index = signalsCache.findIndex(s => s.id === signalId);
    if (index !== -1) {
      signalsCache.splice(index, 1);
    }
  }

  getSignalFolderPath(signal: Signal): string {
    return `/signals/${signal.id}`;
  }
}

export const signalStorage = new SignalStorage();
