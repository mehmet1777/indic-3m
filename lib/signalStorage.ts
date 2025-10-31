import { Signal, SignalFilter } from '@/types/signal';

// In-memory storage for Vercel (serverless environment)
const signalsStore: Signal[] = [];

export class SignalStorage {
  async saveSignal(signal: Signal): Promise<void> {
    const signalData = {
      ...signal,
      folderPath: `/signals/${signal.id}`,
    };
    
    // Remove old signal with same ID if exists
    const existingIndex = signalsStore.findIndex(s => s.id === signal.id);
    if (existingIndex !== -1) {
      signalsStore[existingIndex] = signalData;
    } else {
      signalsStore.push(signalData);
    }
    
    // Keep only last 100 signals to prevent memory issues
    if (signalsStore.length > 100) {
      signalsStore.sort((a, b) => b.timestamp - a.timestamp);
      signalsStore.splice(100);
    }
  }

  async getSignal(signalId: string): Promise<Signal | null> {
    return signalsStore.find(s => s.id === signalId) || null;
  }

  async getAllSignals(): Promise<Signal[]> {
    return [...signalsStore].sort((a, b) => b.timestamp - a.timestamp);
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
    const index = signalsStore.findIndex(s => s.id === signalId);
    if (index === -1) throw new Error('Signal not found');
    
    signalsStore[index] = { ...signalsStore[index], ...updates };
  }

  async deleteSignal(signalId: string): Promise<void> {
    const index = signalsStore.findIndex(s => s.id === signalId);
    if (index === -1) throw new Error('Signal not found');
    
    signalsStore.splice(index, 1);
  }

  getSignalFolderPath(signal: Signal): string {
    return `/signals/${signal.id}`;
  }
}

export const signalStorage = new SignalStorage();
