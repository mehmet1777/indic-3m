'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types/signal';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  signal: Signal;
  timestamp: number;
}

export function SignalNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource('/api/signals/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const signal: Signal = JSON.parse(event.data);
        addNotification(signal);
      } catch (error) {
        console.error('Failed to parse signal notification:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const addNotification = (signal: Signal) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      signal,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClick = (signal: Signal) => {
    router.push(`/signal/${signal.id}`);
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'from-green-600 to-green-500';
      case 'SELL': return 'from-red-600 to-red-500';
      case 'ALERT': return 'from-yellow-600 to-yellow-500';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY': return '📈';
      case 'SELL': return '📉';
      case 'ALERT': return '⚠️';
      default: return '📊';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="pointer-events-auto"
          >
            <div
              onClick={() => handleClick(notification.signal)}
              className={`
                w-80 p-4 rounded-lg shadow-2xl cursor-pointer
                bg-gradient-to-r ${getSignalColor(notification.signal.signalType)}
                border border-white/20 backdrop-blur-sm
                hover:scale-105 transition-transform
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{getSignalIcon(notification.signal.signalType)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-bold text-lg">
                      {notification.signal.symbol}
                    </h4>
                    <span className="text-white/90 text-sm font-semibold px-2 py-1 bg-white/20 rounded">
                      {notification.signal.signalType}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm">
                    Fiyat: ${notification.signal.price.toLocaleString()}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Detaylar için tıklayın
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
