import { Signal } from '@/types/signal';
import { signalStorage } from './signalStorage';
import { screenshotService } from './screenshot';

export class SignalProcessor {
  async processSignal(signal: Signal, chartBlob?: Blob, indicatorBlob?: Blob): Promise<void> {
    try {
      // In Vercel serverless, we can't save files to disk
      // Images would need to be stored in a cloud storage service (S3, Cloudinary, etc.)
      // For now, we just save the signal metadata without images
      
      const updatedSignal: Signal = {
        ...signal,
        chartImagePath: chartBlob ? `/signals/${signal.id}/chart.jpg` : undefined,
        indicatorImagePath: indicatorBlob ? `/signals/${signal.id}/indicator.jpg` : undefined,
        folderPath: `/signals/${signal.id}`
      };

      await signalStorage.saveSignal(updatedSignal);
    } catch (error) {
      console.error('Error processing signal:', error);
      throw error;
    }
  }

  async captureAndProcessSignal(
    signal: Signal,
    chartElement: HTMLElement | null,
    indicatorElement: HTMLElement | null
  ): Promise<void> {
    let chartBlob: Blob | undefined;
    let indicatorBlob: Blob | undefined;

    try {
      if (chartElement) {
        chartBlob = await screenshotService.captureChart(chartElement);
      }

      if (indicatorElement) {
        indicatorBlob = await screenshotService.captureIndicator(indicatorElement);
      }

      await this.processSignal(signal, chartBlob, indicatorBlob);
    } catch (error) {
      console.error('Error capturing and processing signal:', error);
      await this.processSignal(signal);
      throw error;
    }
  }

  async retryProcessSignal(signal: Signal, maxRetries = 3): Promise<void> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.processSignal(signal);
        return;
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError || new Error('Failed to process signal after retries');
  }
}

export const signalProcessor = new SignalProcessor();
