'use client';

import { useState } from 'react';

export interface IndicProSettings {
  channelLength: number;
  averageLength: number;
  rsiLength: number;
  rsiSource: 'İndicPro_DT_v1' | 'açılış' | 'yüksek' | 'düşük' | 'kapanış' | 'hl2' | 'hlc3' | 'ohlc4';
  timeframe: string;
  waitForTimeframeClose: boolean;
  calculateDivergence: boolean;
  channelBandwidth: number;
  channelMultiplier: number;
  maType: 'None' | 'SMA' | 'SMA + Bollinger Bands' | 'EMA' | 'SMMA (RMA)' | 'WMA' | 'VWMA';
  maLength: number;
  bbStdDev: number;
}

export const defaultIndicProSettings: IndicProSettings = {
  channelLength: 10,
  averageLength: 21,
  rsiLength: 10,
  rsiSource: 'yüksek',
  timeframe: '3 dakika',
  waitForTimeframeClose: false,
  calculateDivergence: false,
  channelBandwidth: 8.0,
  channelMultiplier: 3.0,
  maType: 'SMA + Bollinger Bands',
  maLength: 14,
  bbStdDev: 1.5,
};

interface IndicProSettingsPanelProps {
  settings: IndicProSettings;
  onSettingsChange: (settings: IndicProSettings) => void;
}

export const IndicProSettingsPanel = ({ settings, onSettingsChange }: IndicProSettingsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof IndicProSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors"
        title="İndicPro Ayarları"
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-surface border border-border rounded-xl shadow-xl z-50 p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-text-primary">İndicPro Ayarları</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-elevated rounded"
            >
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* İndicPro Settings */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-text-secondary">İndicPro Settings</h5>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Channel Length</label>
                <input
                  type="number"
                  value={settings.channelLength}
                  onChange={(e) => handleChange('channelLength', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-xs text-text-muted mb-1">Average Length</label>
                <input
                  type="number"
                  value={settings.averageLength}
                  onChange={(e) => handleChange('averageLength', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                  min="1"
                  max="100"
                />
              </div>
            </div>


          </div>

          {/* RSI Settings */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-text-secondary">İndicPro RSI Settings</h5>
            
            <div>
              <label className="block text-xs text-text-muted mb-1">İndicPro RSI Length</label>
              <input
                type="number"
                value={settings.rsiLength}
                onChange={(e) => handleChange('rsiLength', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={settings.calculateDivergence}
                  onChange={(e) => handleChange('calculateDivergence', e.target.checked)}
                  className="rounded"
                />
                İndicPro Divergence
              </label>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">Kaynak</label>
              <select
                value={settings.rsiSource}
                onChange={(e) => handleChange('rsiSource', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
              >
                <option value="İndicPro_DT_v1">İndicPro_DT_v1</option>
                <option value="açılış">açılış</option>
                <option value="yüksek">yüksek</option>
                <option value="düşük">düşük</option>
                <option value="kapanış">kapanış</option>
                <option value="hl2">hl2</option>
                <option value="hlc3">hlc3</option>
                <option value="ohlc4">ohlc4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1">Zaman aralığı</label>
              <select
                value={settings.timeframe}
                onChange={(e) => handleChange('timeframe', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
              >
                <option value="">Mevcut</option>
                <option value="1 dakika">1 dakika</option>
                <option value="3 dakika">3 dakika</option>
                <option value="5 dakika">5 dakika</option>
                <option value="15 dakika">15 dakika</option>
                <option value="1 saat">1 saat</option>
                <option value="4 saat">4 saat</option>
                <option value="1 gün">1 gün</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={settings.waitForTimeframeClose}
                  onChange={(e) => handleChange('waitForTimeframeClose', e.target.checked)}
                  className="rounded"
                />
                Zaman aralığının kapanmasını bekleyin
              </label>
            </div>
          </div>

          {/* Channel Settings */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-text-secondary">İndicPro Channel Settings</h5>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Channel Bandwidth</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.channelBandwidth}
                  onChange={(e) => handleChange('channelBandwidth', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                  min="0"
                  max="50"
                />
              </div>
              
              <div>
                <label className="block text-xs text-text-muted mb-1">Channel Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.channelMultiplier}
                  onChange={(e) => handleChange('channelMultiplier', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Moving Average Settings */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-text-secondary">İndicPro Moving Average</h5>
            
            <div>
              <label className="block text-xs text-text-muted mb-1">MA Type</label>
              <select
                value={settings.maType}
                onChange={(e) => handleChange('maType', e.target.value)}
                className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
              >
                <option value="None">None</option>
                <option value="SMA">SMA</option>
                <option value="SMA + Bollinger Bands">SMA + Bollinger Bands</option>
                <option value="EMA">EMA</option>
                <option value="SMMA (RMA)">SMMA (RMA)</option>
                <option value="WMA">WMA</option>
                <option value="VWMA">VWMA</option>
              </select>
            </div>

            {settings.maType !== 'None' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">MA Length</label>
                  <input
                    type="number"
                    value={settings.maLength}
                    onChange={(e) => handleChange('maLength', parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                    min="1"
                    max="100"
                  />
                </div>
                
                {settings.maType === 'SMA + Bollinger Bands' && (
                  <div>
                    <label className="block text-xs text-text-muted mb-1">BB StdDev</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.bbStdDev}
                      onChange={(e) => handleChange('bbStdDev', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border rounded text-text-primary"
                      min="0.1"
                      max="5"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="pt-3 border-t border-border">
            <button
              onClick={() => onSettingsChange(defaultIndicProSettings)}
              className="w-full px-3 py-2 text-sm bg-surface-elevated hover:bg-surface border border-border rounded-lg text-text-primary transition-colors"
            >
              Varsayılan Ayarlara Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};