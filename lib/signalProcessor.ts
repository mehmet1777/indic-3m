import { Signal } from '@/types/signal';
import { signalStorage } from './signalStorage';
import { screenshotService } from './screenshot';
import { put } from '@vercel/blob';
import { compressImage } from './imageCompression';

export class SignalProcessor {
  async processSignal(signal: Signal, chartBlob?: Blob, indicatorBlob?: Blob): Promise<void> {
    try {
      let chartImagePath: string | undefined;
      let indicatorImagePath: string | undefined;

      // Upload chart image to Vercel Blob
      if (chartBlob) {
        try {
          const compressedChart = await compressImage(chartBlob, 500);
          const blob = await put(`signals/${signal.id}/chart.jpg`, compressedChart, {
            access: 'public',
            addRandomSuffix: false,
          });
          chartImagePath = blob.url;
          console.log('Chart image uploaded:', blob.url);
        } catch (error) {
          console.error('Error uploading chart image:', error);
        }
      }

      // Upload indicator image to Vercel Blob
      if (indicatorBlob) {
        try {
          const compressedIndicator = await compressImage(indicatorBlob, 500);
          const blob = await put(`signals/${signal.id}/indicator.jpg`, compressedIndicator, {
            access: 'public',
            addRandomSuffix: false,
          });
          indicatorImagePath = blob.url;
          console.log('Indicator image uploaded:', blob.url);
        } catch (error) {
          console.error('Error uploading indicator image:', error);
        }
      }

      const updatedSignal: Signal = {
        ...signal,
        chartImagePath,
        indicatorImagePath,
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
