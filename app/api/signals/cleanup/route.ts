import { NextRequest, NextResponse } from 'next/server';
import { signalStorage } from '@/lib/signalStorage';

/**
 * DELETE /api/signals/cleanup
 * Sinyalleri temizler
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const olderThan = searchParams.get('olderThan'); // hours
    
    if (olderThan) {
      // Belirli süreden eski sinyalleri sil
      const hours = parseInt(olderThan);
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      
      const allSignals = await signalStorage.getAllSignals();
      const signalsToDelete = allSignals.filter(s => s.timestamp < cutoffTime);
      
      // Her sinyali sil
      for (const signal of signalsToDelete) {
        await signalStorage.deleteSignal(signal.id);
      }
      
      return NextResponse.json({
        success: true,
        deletedCount: signalsToDelete.length,
        message: `${signalsToDelete.length} sinyal temizlendi`
      });
    } else {
      // Tüm sinyalleri sil
      const allSignals = await signalStorage.getAllSignals();
      
      for (const signal of allSignals) {
        await signalStorage.deleteSignal(signal.id);
      }
      
      return NextResponse.json({
        success: true,
        deletedCount: allSignals.length,
        message: `${allSignals.length} sinyal temizlendi`
      });
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Temizleme başarısız' },
      { status: 500 }
    );
  }
}
