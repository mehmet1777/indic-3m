import { screenshotService } from '@/lib/screenshot';

describe('Screenshot Capture', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElement.style.width = '800px';
    mockElement.style.height = '600px';
    mockElement.style.backgroundColor = '#0a0e27';
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  describe('Chart Capture', () => {
    it('should capture chart element as blob', async () => {
      const blob = await screenshotService.captureChart(mockElement);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should throw error for null element', async () => {
      await expect(
        screenshotService.captureChart(null as any)
      ).rejects.toThrow('Chart element not found');
    });
  });

  describe('Indicator Capture', () => {
    it('should capture indicator element as blob', async () => {
      const blob = await screenshotService.captureIndicator(mockElement);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });
  });

  describe('Image Quality', () => {
    it('should generate high quality images', async () => {
      const blob = await screenshotService.captureElement(mockElement, {
        quality: 0.95,
        scale: 2
      });
      
      expect(blob.size).toBeGreaterThan(1000);
    });
  });
});
