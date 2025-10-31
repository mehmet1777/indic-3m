import { Signal } from '@/types/signal';

type Listener = (signal: Signal) => void;

class SignalBroadcaster {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  broadcast(signal: Signal): void {
    this.listeners.forEach(listener => {
      try {
        listener(signal);
      } catch (error) {
        console.error('Error in signal listener:', error);
      }
    });
  }

  getListenerCount(): number {
    return this.listeners.size;
  }
}

export const signalBroadcaster = new SignalBroadcaster();
