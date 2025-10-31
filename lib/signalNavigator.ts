import { Signal } from '@/types/signal';

export class SignalNavigator {
  private signalQueue: Signal[] = [];
  private isProcessing = false;

  addSignal(signal: Signal): void {
    this.signalQueue.push(signal);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.signalQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const signal = this.signalQueue.shift()!;

    try {
      await this.navigateToChart(signal);
      await this.waitForChartLoad();
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Failed to process signal:', error);
    }

    this.processQueue();
  }

  private async navigateToChart(signal: Signal): Promise<void> {
    const url = `/chart/${signal.symbol}?capture=true&signalId=${signal.id}`;
    window.location.href = url;
  }

  private async waitForChartLoad(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const chartElement = document.querySelector('[data-chart-loaded="true"]');
        if (chartElement) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  getQueueLength(): number {
    return this.signalQueue.length;
  }

  clearQueue(): void {
    this.signalQueue = [];
    this.isProcessing = false;
  }
}

export const signalNavigator = new SignalNavigator();
