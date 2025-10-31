'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NavigationButtons() {
  const router = useRouter();

  const handleSignalsClick = () => {
    router.push('/signals');
  };

  const handleIndicatorImagesClick = () => {
    router.push('/indicator-images');
  };

  return (
    <div className="fixed top-6 left-6 z-50 flex gap-3">
      <motion.button
        onClick={handleSignalsClick}
        className="px-4 py-2 bg-surface-elevated text-text-primary rounded-lg border border-border hover:bg-primary hover:border-primary transition-all duration-150 ease-out font-medium text-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Gelen Sinyaller
      </motion.button>
      
      <motion.button
        onClick={handleIndicatorImagesClick}
        className="px-4 py-2 bg-surface-elevated text-text-primary rounded-lg border border-border hover:bg-primary hover:border-primary transition-all duration-150 ease-out font-medium text-sm shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        İndikatör Resimleri
      </motion.button>
    </div>
  );
}
