import { signalStorage } from '@/lib/signalStorage';
import { Signal } from '@/types/signal';

describe('Signal Reception and Storage', () => {
  const testSignal: Signal = {
    id: 'test-reception-1',
    timestamp: Date.now(),
    symbol: 'BTCUSDT',
    signalType: 'BUY',
    price: 50000,
    folderPath: '',
    metadata: { source: 'webhook-test' }
  };

  afterEach(async () => {
    try {
      await signalStorage.deleteSignal(testSignal.id);
    } catch (error) {
      // Cleanup errors are acceptable
    }
  });

  describe('Webhook Endpoint', () => {
    it('should accept valid signal payload', async () => {
      const payload = {
        symbol: 'BTCUSDT',
        signalType: 'BUY',
        price: 50000,
        timestamp: Date.now()
      };

      const response = await fetch('http://localhost:3000/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.signalId).toBeDefined();
    });

    it('should reject invalid signal payload', async () => {
      const invalidPayload = {
        symbol: 'BTCUSDT',
        // Missing required fields
      };

      const response = await fetch('http://localhost:3000/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload)
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Folder Structure', () => {
    it('should create correct folder hierarchy', async () => {
      await signalStorage.saveSignal(testSignal);
      
      const retrieved = await signalStorage.getSignal(testSignal.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.folderPath).toContain(testSignal.symbol);
      expect(retrieved?.folderPath).toContain(testSignal.signalType);
      
      const date = new Date(testSignal.timestamp).toISOString().split('T')[0];
      expect(retrieved?.folderPath).toContain(date);
    });

    it('should organize signals by date', async () => {
      const signal1 = { ...testSignal, id: 'test-date-1', timestamp: Date.now() };
      const signal2 = { ...testSignal, id: 'test-date-2', timestamp: Date.now() - 86400000 };

      await signalStorage.saveSignal(signal1);
      await signalStorage.saveSignal(signal2);

      const allSignals = await signalStorage.getAllSignals();
      const testSignals = allSignals.filter(s => s.id.startsWith('test-date'));

      expect(testSignals.length).toBeGreaterThanOrEqual(2);

      await signalStorage.deleteSignal(signal1.id);
      await signalStorage.deleteSignal(signal2.id);
    });
  });

  describe('Signal Metadata', () => {
    it('should store signal metadata in JSON file', async () => {
      await signalStorage.saveSignal(testSignal);
      
      const retrieved = await signalStorage.getSignal(testSignal.id);
      expect(retrieved?.metadata).toEqual(testSignal.metadata);
      expect(retrieved?.symbol).toBe(testSignal.symbol);
      expect(retrieved?.signalType).toBe(testSignal.signalType);
      expect(retrieved?.price).toBe(testSignal.price);
    });

    it('should update signal metadata', async () => {
      await signalStorage.saveSignal(testSignal);
      
      await signalStorage.updateSignalMetadata(testSignal.id, {
        chartImagePath: '/test/chart.png',
        indicatorImagePath: '/test/indicator.png'
      });

      const updated = await signalStorage.getSignal(testSignal.id);
      expect(updated?.chartImagePath).toBe('/test/chart.png');
      expect(updated?.indicatorImagePath).toBe('/test/indicator.png');
    });
  });
});
