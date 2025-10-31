import { Signal, SignalFilter } from '@/types/signal';
import path from 'path';
import fs from 'fs/promises';

const SIGNALS_BASE_DIR = path.join(process.cwd(), 'public', 'signals');

export class SignalStorage {
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async createSignalFolder(signal: Signal): Promise<string> {
    const date = new Date(signal.timestamp);
    const dateFolder = date.toISOString().split('T')[0];
    const signalFolder = `${signal.symbol}-${signal.timestamp}-${signal.signalType}`;
    
    const folderPath = path.join(SIGNALS_BASE_DIR, dateFolder, signalFolder);
    await this.ensureDirectory(folderPath);
    
    return folderPath;
  }

  async saveSignal(signal: Signal): Promise<void> {
    const folderPath = await this.createSignalFolder(signal);
    const metadataPath = path.join(folderPath, 'signal.json');
    
    const signalData = {
      ...signal,
      folderPath: folderPath.replace(process.cwd(), ''),
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(signalData, null, 2), 'utf-8');
  }

  async getSignal(signalId: string): Promise<Signal | null> {
    const signals = await this.getAllSignals();
    return signals.find(s => s.id === signalId) || null;
  }

  async getAllSignals(): Promise<Signal[]> {
    try {
      await this.ensureDirectory(SIGNALS_BASE_DIR);
      const signals: Signal[] = [];
      
      const dateFolders = await fs.readdir(SIGNALS_BASE_DIR);
      
      for (const dateFolder of dateFolders) {
        const datePath = path.join(SIGNALS_BASE_DIR, dateFolder);
        const stat = await fs.stat(datePath);
        
        if (!stat.isDirectory()) continue;
        
        const signalFolders = await fs.readdir(datePath);
        
        for (const signalFolder of signalFolders) {
          const signalPath = path.join(datePath, signalFolder);
          const signalStat = await fs.stat(signalPath);
          
          if (!signalStat.isDirectory()) continue;
          
          const metadataPath = path.join(signalPath, 'signal.json');
          
          try {
            const data = await fs.readFile(metadataPath, 'utf-8');
            const signal = JSON.parse(data) as Signal;
            signals.push(signal);
          } catch {
            continue;
          }
        }
      }
      
      return signals.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
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
    const signal = await this.getSignal(signalId);
    if (!signal) throw new Error('Signal not found');
    
    const updatedSignal = { ...signal, ...updates };
    const metadataPath = path.join(process.cwd(), signal.folderPath, 'signal.json');
    
    await fs.writeFile(metadataPath, JSON.stringify(updatedSignal, null, 2), 'utf-8');
  }

  async deleteSignal(signalId: string): Promise<void> {
    const signal = await this.getSignal(signalId);
    if (!signal) throw new Error('Signal not found');
    
    const folderPath = path.join(process.cwd(), signal.folderPath);
    await fs.rm(folderPath, { recursive: true, force: true });
  }

  getSignalFolderPath(signal: Signal): string {
    const date = new Date(signal.timestamp);
    const dateFolder = date.toISOString().split('T')[0];
    const signalFolder = `${signal.symbol}-${signal.timestamp}-${signal.signalType}`;
    
    return path.join(SIGNALS_BASE_DIR, dateFolder, signalFolder);
  }
}

export const signalStorage = new SignalStorage();
