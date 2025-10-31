'use client';

import { useState } from 'react';
import { IndicatorSettings, MAType, defaultIndicatorSettings } from '@/types/indicator';

interface IndicatorSettingsProps {
  settings: IndicatorSettings;
  onSettingsChange: (settings: IndicatorSettings) => void;
}

export const IndicatorSettingsPanel = ({ settings, onSettingsChange }: IndicatorSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'inputs' | 'style' | 'visibility'>('inputs');

  const handleApply = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalSettings(defaultIndicatorSettings);
  };

  const maTypes: MAType[] = ['None', 'SMA', 'SMA + Bollinger Bands', 'EMA', 'SMMA (RMA)', 'WMA', 'VWMA'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg transition-colors"
        title="Indicator Settings"
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-12 z-50 w-96 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="text-lg font-semibold text-text-primary">İndicPro</h4>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('inputs')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'inputs' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                Girdiler
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'style' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                Stil
              </button>
              <button
                onClick={() => setActiveTab('visibility')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'visibility' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                Görünürlük
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {activeTab === 'inputs' && (
                <div className="space-y-4">
                  {/* İndicPro Settings */}
                  <div className="text-xs font-semibold text-text-muted uppercase mb-2">İndicPro Settings</div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Channel Length</label>
                    <input
                      type="number"
                      value={localSettings.channelLength}
                      onChange={(e) => setLocalSettings({ ...localSettings, channelLength: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Average Length</label>
                    <input
                      type="number"
                      value={localSettings.averageLength}
                      onChange={(e) => setLocalSettings({ ...localSettings, averageLength: parseInt(e.target.value) || 21 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Over Bought Level 1</label>
                      <input
                        type="number"
                        value={localSettings.obLevel1}
                        onChange={(e) => setLocalSettings({ ...localSettings, obLevel1: parseInt(e.target.value) || 60 })}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Over Bought Level 2</label>
                      <input
                        type="number"
                        value={localSettings.obLevel2}
                        onChange={(e) => setLocalSettings({ ...localSettings, obLevel2: parseInt(e.target.value) || 53 })}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Over Sold Level 1</label>
                      <input
                        type="number"
                        value={localSettings.osLevel1}
                        onChange={(e) => setLocalSettings({ ...localSettings, osLevel1: parseInt(e.target.value) || -60 })}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-secondary mb-1">Over Sold Level 2</label>
                      <input
                        type="number"
                        value={localSettings.osLevel2}
                        onChange={(e) => setLocalSettings({ ...localSettings, osLevel2: parseInt(e.target.value) || -53 })}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* RSI Settings */}
                  <div className="text-xs font-semibold text-text-muted uppercase mb-2 mt-6">İndicPro RSI Settings</div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">İndicPro RSI Length</label>
                    <input
                      type="number"
                      value={localSettings.rsiLength}
                      onChange={(e) => setLocalSettings({ ...localSettings, rsiLength: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localSettings.calculateDivergence}
                      onChange={(e) => setLocalSettings({ ...localSettings, calculateDivergence: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-text-secondary">İndicPro Divergence</label>
                  </div>

                  {/* Channel Settings */}
                  <div className="text-xs font-semibold text-text-muted uppercase mb-2 mt-6">İndicPro Channel Settings</div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Channel Bandwidth</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localSettings.channelBandwidth}
                      onChange={(e) => setLocalSettings({ ...localSettings, channelBandwidth: parseFloat(e.target.value) || 8 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Channel Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={localSettings.channelMultiplier}
                      onChange={(e) => setLocalSettings({ ...localSettings, channelMultiplier: parseFloat(e.target.value) || 1.5 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Moving Average */}
                  <div className="text-xs font-semibold text-text-muted uppercase mb-2 mt-6">İndicPro Moving Average</div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Tip</label>
                    <select
                      value={localSettings.maType}
                      onChange={(e) => setLocalSettings({ ...localSettings, maType: e.target.value as MAType })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    >
                      {maTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Uzunluk</label>
                    <input
                      type="number"
                      value={localSettings.maLength}
                      onChange={(e) => setLocalSettings({ ...localSettings, maLength: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  {localSettings.maType === 'SMA + Bollinger Bands' && (
                    <div>
                      <label className="block text-sm text-text-secondary mb-1">BB Std Sapma</label>
                      <input
                        type="number"
                        step="0.1"
                        value={localSettings.bbStdDev}
                        onChange={(e) => setLocalSettings({ ...localSettings, bbStdDev: parseFloat(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {/* Display Settings */}
                  <div className="text-xs font-semibold text-text-muted uppercase mb-2 mt-6">Girdi Değerleri</div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localSettings.showOnChart}
                      onChange={(e) => setLocalSettings({ ...localSettings, showOnChart: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-text-secondary">Durum satındaki girdiler</label>
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="text-center py-8 text-text-muted">
                  Stil ayarları yakında eklenecek
                </div>
              )}

              {activeTab === 'visibility' && (
                <div className="text-center py-8 text-text-muted">
                  Görünürlük ayarları yakında eklenecek
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-border">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface border border-border text-text-primary rounded-lg transition-colors text-sm"
              >
                Varsayılan
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-surface-elevated hover:bg-surface border border-border text-text-primary rounded-lg transition-colors text-sm"
              >
                İptal
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium text-sm"
              >
                Tamam
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
