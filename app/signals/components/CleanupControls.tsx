'use client';

import React, { useState, useEffect } from 'react';
import { CleanupModal } from './CleanupModal';

interface CleanupControlsProps {
    signalCount: number;
    onCleanupComplete: () => void;
}

export const CleanupControls = React.memo(({ signalCount, onCleanupComplete }: CleanupControlsProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showUndo, setShowUndo] = useState(false);
    const [deletedSignals, setDeletedSignals] = useState<any[]>([]);
    const [autoCleanup, setAutoCleanup] = useState<string>('off');
    const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

    // Otomatik temizleme ayarını yükle
    useEffect(() => {
        const saved = localStorage.getItem('autoCleanupInterval');
        if (saved) {
            setAutoCleanup(saved);
        }

        const lastCleanupTime = localStorage.getItem('lastCleanupTime');
        if (lastCleanupTime) {
            setLastCleanup(new Date(parseInt(lastCleanupTime)));
        }
    }, []);

    // Otomatik temizleme kontrolü
    useEffect(() => {
        if (autoCleanup === 'off') return;

        const checkAndCleanup = async () => {
            const intervals: Record<string, number> = {
                '3h': 3,
                '6h': 6,
                '9h': 9,
                '12h': 12,
                '1d': 24,
                '3d': 72,
                '7d': 168,
            };

            const hours = intervals[autoCleanup];
            if (!hours) return;

            const lastCleanupTime = localStorage.getItem('lastCleanupTime');
            const now = Date.now();

            if (!lastCleanupTime || (now - parseInt(lastCleanupTime)) > hours * 60 * 60 * 1000) {
                await performCleanup(hours);
                localStorage.setItem('lastCleanupTime', now.toString());
                setLastCleanup(new Date(now));
            }
        };

        checkAndCleanup();
        const interval = setInterval(checkAndCleanup, 60 * 60 * 1000); // Her saat kontrol et

        return () => clearInterval(interval);
    }, [autoCleanup]);

    const handleAutoCleanupChange = (value: string) => {
        setAutoCleanup(value);
        localStorage.setItem('autoCleanupInterval', value);
    };

    const performCleanup = async (olderThanHours?: number) => {
        setIsDeleting(true);

        try {
            const url = olderThanHours
                ? `/api/signals/cleanup?olderThan=${olderThanHours}`
                : '/api/signals/cleanup';

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();

                // Success toast
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg animate-fadeIn';
                toast.innerHTML = `✅ ${data.deletedCount} sinyal temizlendi`;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.remove();
                }, 3000);

                onCleanupComplete();
            }
        } catch (error) {
            console.error('Cleanup error:', error);

            // Error toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl shadow-lg animate-fadeIn';
            toast.innerHTML = '❌ Temizleme başarısız';
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const handleClearAll = () => {
        setShowConfirm(true);
    };

    const confirmClearAll = async () => {
        await performCleanup();
    };

    const formatLastCleanup = () => {
        if (!lastCleanup) return null;

        const now = Date.now();
        const diff = now - lastCleanup.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} gün önce`;
        } else if (hours > 0) {
            return `${hours} saat önce`;
        } else {
            return 'Az önce';
        }
    };

    return (
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Otomatik Temizleme Dropdown */}
            <div className="flex items-center gap-3">
                <label className="text-gray-400 text-sm font-medium">
                    ⏰ Otomatik Temizleme:
                </label>
                <select
                    value={autoCleanup}
                    onChange={(e) => handleAutoCleanupChange(e.target.value)}
                    className="px-4 py-2 bg-white/5 backdrop-blur-md text-white rounded-xl border-2 border-white/10 focus:border-purple-500 focus:outline-none transition-all cursor-pointer hover:bg-white/10 text-sm"
                >
                    <option value="off" className="bg-[#1a1a2e]">Kapalı</option>
                    <option value="3h" className="bg-[#1a1a2e]">3 saat sonra</option>
                    <option value="6h" className="bg-[#1a1a2e]">6 saat sonra</option>
                    <option value="9h" className="bg-[#1a1a2e]">9 saat sonra</option>
                    <option value="12h" className="bg-[#1a1a2e]">12 saat sonra</option>
                    <option value="1d" className="bg-[#1a1a2e]">1 gün sonra</option>
                    <option value="3d" className="bg-[#1a1a2e]">3 gün sonra</option>
                    <option value="7d" className="bg-[#1a1a2e]">7 gün sonra</option>
                </select>

                {lastCleanup && autoCleanup !== 'off' && (
                    <span className="text-gray-500 text-xs">
                        Son temizleme: {formatLastCleanup()}
                    </span>
                )}
            </div>

            {/* Tümünü Temizle Butonu */}
            <button
                onClick={handleClearAll}
                disabled={signalCount === 0 || isDeleting}
                className="group px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-semibold flex items-center gap-2 active:scale-95"
            >
                {isDeleting ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        <span>Temizleniyor...</span>
                    </>
                ) : (
                    <>
                        <span>🗑️</span>
                        <span>Tümünü Temizle</span>
                    </>
                )}
            </button>

            {/* Onay Modal */}
            {showConfirm && (
                <CleanupModal
                    signalCount={signalCount}
                    onConfirm={confirmClearAll}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    );
});

CleanupControls.displayName = 'CleanupControls';
