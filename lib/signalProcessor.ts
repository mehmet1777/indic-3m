import { Signal } from '@/types/signal';
import { signalStorage } from './signalStorage';
import { screenshotService } from './screenshot';
import { compressImage } from './imageCompression';
import path from 'path';
import { writeFile } from 'fs/promises';

export class SignalProcessor {
  async processSignal(signal: Signal, chartBlob?: Blob, indicatorBlob?: Blob): Promise<void> {
    try {
      const folderPath = await signalStorage.createSignalFolder(signal);
      
      let chartImagePath: string | undefined;
      let indicatorImagePath: string | undefined;

      if (chartBlob) {
        const compressedChart = await compressImage(chartBlob, 500);
        const chartFilename = `chart-${signal.timestamp}.jpg`;
        const chartPath = path.join(folderPath, chartFilename);
        const buffer = Buffer.from(await compressedChart.arrayBuffer());
        await writeFile(chartPath, buffer);
        chartImagePath = chartPath.replace(process.cwd(), '');
      }

      if (indicatorBlob) {
        const compressedIndicator = await compressImage(indicatorBlob, 500);
        const indicatorFilename = `indicator-${signal.timestamp}.jpg`;
        const indicatorPath = path.join(folderPath, indicatorFilename);
        const buffer = Buffer.from(await compressedIndicator.arrayBuffer());
        await writeFile(indicatorPath, buffer);
        indicatorImagePath = indicatorPath.replace(process.cwd(), '');
      }

      const updatedSignal: Signal = {
        ...signal,
        chartImagePath,
        indicatorImagePath,
        folderPath: folderPath.replace(process.cwd(), '')
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
