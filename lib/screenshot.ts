import domtoimage from 'dom-to-image-more';

export interface ScreenshotOptions {
  quality?: number;
  backgroundColor?: string;
  scale?: number;
}

export class ScreenshotService {
  private defaultOptions: ScreenshotOptions = {
    quality: 0.95,
    backgroundColor: '#0a0e27',
    scale: 2
  };

  async captureElement(element: HTMLElement, options?: ScreenshotOptions): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Use higher quality settings for better screenshots
      const blob = await domtoimage.toBlob(element, {
        quality: 1.0,
        bgcolor: opts.backgroundColor,
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: element.offsetWidth + 'px',
          height: element.offsetHeight + 'px'
        }
      });

      return blob;
    } catch (error) {
      throw new Error(`Screenshot capture failed: ${error}`);
    }
  }

  async captureChart(chartRef: HTMLElement): Promise<Blob> {
    if (!chartRef) {
      throw new Error('Chart element not found');
    }
    
    return this.captureElement(chartRef);
  }

  async captureIndicator(indicatorRef: HTMLElement): Promise<Blob> {
    if (!indicatorRef) {
      throw new Error('Indicator element not found');
    }
    
    return this.captureElement(indicatorRef);
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async saveScreenshot(blob: Blob, filename: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', blob, filename);
    
    const response = await fetch('/api/upload-screenshot', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to save screenshot');
    }
    
    const data = await response.json();
    return data.path;
  }

  generateFilename(symbol: string, type: 'chart' | 'indicator', timestamp: number): string {
    return `${symbol}-${type}-${timestamp}.png`;
  }


}

export const screenshotService = new ScreenshotService();
