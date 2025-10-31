import { SignalStorage } from '@/lib/signalStorage';
import { Signal } from '@/types/signal';
import fs from 'fs/promises';
import path from 'path';

describe('SignalStorage', () => {
  let storage: SignalStorage;
  const testSignal: Signal = {
    id: 'test-signal-1',
    timestamp: Date.now(),
    symbol: 'BTCUSDT',
    signalType: 'BUY',
    price: 50000,
    folderPath: '',
    metadata: { source: 'test' }
  };

  beforeEach(() => {
    storage = new SignalStorage();
  });

  describe('createSignalFolder', () => {
    it('should create folder with correct structure', async () => {
      const folderPath = await storage.createSignalFolder(testSignal);
      
      expect(folderPath).toContain('signals');
      expect(folderPath).toContain(testSignal.symbol);
      expect(folderPath).toContain(testSignal.signalType);
      
      const exists = await fs.access(folderPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should organize folders by date', async () => {
      const folderPath = await storage.createSignalFolder(testSignal);
      const date = new Date(testSignal.timestamp).toISOString().split('T')[0];
      
      expect(folderPath).toContain(date);
    });
  });

  describe('saveSignal', () => {
    it('should save signal metadata to JSON file', async () => {
      await storage.saveSignal(testSignal);
      
      const signals = await storage.getAllSignals();
      const savedSignal = signals.find(s => s.id === testSignal.id);
      
      expect(savedSignal).toBeDefined();
      expect(savedSignal?.symbol).toBe(testSignal.symbol);
      expect(savedSignal?.signalType).toBe(testSignal.signalType);
    });
  });

  describe('getSignal', () => {
    it('should retrieve signal by id', async () => {
      await storage.saveSignal(testSignal);
      
      const retrieved = await storage.getSignal(testSignal.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testSignal.id);
    });

    it('should return null for non-existent signal', async () => {
      const retrieved = await storage.getSignal('non-existent-id');
      
      expect(retrieved).toBeNull();
    });
  });

  describe('filterSignals', () => {
    beforeEach(async () => {
      await storage.saveSignal(testSignal);
      await storage.saveSignal({
        ...testSignal,
        id: 'test-signal-2',
        symbol: 'ETHUSDT',
        signalType: 'SELL'
      });
    });

    it('should filter by symbol', async () => {
      const filtered = await storage.filterSignals({ symbol: 'BTCUSDT' });
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(s => s.symbol === 'BTCUSDT')).toBe(true);
    });

    it('should filter by signal type', async () => {
      const filtered = await storage.filterSignals({ signalType: 'BUY' });
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(s => s.signalType === 'BUY')).toBe(true);
    });

    it('should filter by date range', async () => {
      const now = Date.now();
      const filtered = await storage.filterSignals({
        dateFrom: now - 1000000,
        dateTo: now + 1000000
      });
      
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('updateSignalMetadata', () => {
    it('should update signal metadata', async () => {
      await storage.saveSignal(testSignal);
      
      await storage.updateSignalMetadata(testSignal.id, {
        chartImagePath: '/path/to/chart.png'
      });
      
      const updated = await storage.getSignal(testSignal.id);
      expect(updated?.chartImagePath).toBe('/path/to/chart.png');
    });
  });

  afterEach(async () => {
    try {
      const signals = await storage.getAllSignals();
      for (const signal of signals) {
        if (signal.id.startsWith('test-signal')) {
          await storage.deleteSignal(signal.id);
        }
      }
    } catch (error) {
      // Cleanup errors are acceptable in tests
    }
  });
});
