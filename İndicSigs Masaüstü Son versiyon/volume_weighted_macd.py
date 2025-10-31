import pandas as pd
import numpy as np

def format_small_number(number, precision=9):
    """
    Küçük sayıları bilimsel gösterim olmadan formatlar
    """
    if number == 0:
        return "0.0"
    
    # Bilimsel gösterimi engelle ve sabit ondalık gösterim kullan
    format_str = '{:.' + str(precision) + 'f}'
    return format_str.format(number)

def volume_weighted_macd(df, fast_period=26, slow_period=12, signal_period=9):
    """
    Volume Weighted MACD göstergesini hesaplar
    
    Parametreler:
    df : DataFrame - 'close' ve 'volume' sütunları içeren OHLCV verisi
    fast_period : int - Uzun periyot (varsayılan: 26)
    slow_period : int - Kısa periyot (varsayılan: 12)
    signal_period : int - Sinyal çizgisi periyodu (varsayılan: 9)
    
    Dönüş:
    dict - MACD değerleri ve histogram renkleri
    """
    # Hacim * Kapanış değerlerini hesapla
    df['volume_close'] = df['volume'] * df['close']
    
    # Hızlı ve yavaş EMA hesaplamaları
    volume_ema_fast = df['volume'].ewm(span=fast_period, adjust=False).mean()
    volume_close_ema_fast = df['volume_close'].ewm(span=fast_period, adjust=False).mean()
    maFast = volume_close_ema_fast / volume_ema_fast
    
    volume_ema_slow = df['volume'].ewm(span=slow_period, adjust=False).mean()
    volume_close_ema_slow = df['volume_close'].ewm(span=slow_period, adjust=False).mean()
    maSlow = volume_close_ema_slow / volume_ema_slow
    
    # MACD çizgisi
    d = maSlow - maFast
    
    # Sinyal çizgisi
    maSignal = d.ewm(span=signal_period, adjust=False).mean()
    
    # Histogram
    dm = d - maSignal
    
    # Histogram renklerini belirle
    colors = []
    prev_dm = None
    for curr_dm in dm:
        if prev_dm is None:
            colors.append('orange')
        else:
            if curr_dm >= 0:
                colors.append('green' if curr_dm > prev_dm else 'orange')
            else:
                colors.append('red' if curr_dm < prev_dm else 'orange')
        prev_dm = curr_dm
    
    return {
        'macd': format_small_number(d.iloc[-1]),
        'signal': format_small_number(maSignal.iloc[-1]),
        'histogram': format_small_number(dm.iloc[-1]),
        'histogram_color': colors[-1],
        'full_data': {
            'macd': d,
            'signal': maSignal,
            'histogram': dm,
            'colors': colors
        }
    }

# Örnek kullanım:
if __name__ == "__main__":
    # Örnek veri oluştur
    df = pd.DataFrame({
        'close': [100, 101, 102, 101, 99],
        'volume': [1000, 1100, 900, 1200, 1000]
    })
    
    # Göstergeyi hesapla
    result = volume_weighted_macd(df)
    print("MACD:", result['macd'])
    print("Signal:", result['signal'])
    print("Histogram:", result['histogram'])
    print("Histogram Color:", result['histogram_color'])
