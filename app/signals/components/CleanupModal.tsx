'use client';

interface CleanupModalProps {
  signalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CleanupModal = ({ signalCount, onConfirm, onCancel }: CleanupModalProps) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onCancel}
    >
      <div 
        className="relative bg-[#1a1a2e] border-2 border-red-500/30 rounded-3xl p-12 w-full max-w-3xl shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 80px rgba(239, 68, 68, 0.4), 0 25px 50px rgba(0, 0, 0, 0.6)',
          minWidth: '600px'
        }}
      >
        {/* Gradient border effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl opacity-20 blur-xl"></div>
        
        <div className="relative">
          {/* Icon and Title */}
          <div className="text-center mb-10">
            <div className="text-8xl mb-5 animate-bounce inline-block">⚠️</div>
            <h3 className="text-5xl font-black text-white mb-3">
              Tüm Sinyalleri Sil?
            </h3>
          </div>
          
          {/* Signal Count Box */}
          <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-10 mb-8">
            <p className="text-center">
              <span className="block text-7xl font-black text-red-400 mb-4">{signalCount}</span>
              <span className="text-gray-300 text-2xl font-semibold">sinyal kalıcı olarak silinecek!</span>
            </p>
          </div>
          
          {/* Warning Text */}
          <p className="text-gray-400 text-center text-xl mb-12 font-medium">
            Bu işlem geri alınamaz. Emin misiniz?
          </p>
          
          {/* Buttons */}
          <div className="flex gap-6">
            <button
              onClick={onCancel}
              className="flex-1 px-12 py-6 bg-white/5 hover:bg-white/10 text-white text-2xl rounded-xl transition-all border-2 border-white/10 hover:border-white/20 font-bold active:scale-95"
            >
              ❌ İptal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-12 py-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-2xl rounded-xl transition-all shadow-lg shadow-red-500/40 font-bold active:scale-95"
            >
              ✅ Evet, Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
