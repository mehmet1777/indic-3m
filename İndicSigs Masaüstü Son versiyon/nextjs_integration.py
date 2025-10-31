"""
Next.js API Entegrasyon Modülü

Bu modül İndicSigs programından Next.js API'ye sinyal gönderir.
main.py dosyasındaki send_telegram_message fonksiyonuna eklenecek.
"""

import requests
import json
import re
from datetime import datetime

# Next.js API URL
# Local test için: http://localhost:3000/api/signals
# Production için: https://indic-3m.vercel.app/api/signals
import os

# Ortam değişkeninden al, yoksa production kullan
NEXTJS_API_URL = os.getenv('NEXTJS_API_URL', 'https://indic-3m.vercel.app/api/signals')

def parse_signal_from_message(message):
    """
    Telegram mesajından sinyal bilgilerini çıkarır
    
    Args:
        message (str): Telegram mesajı
        
    Returns:
        dict: Sinyal verisi veya None
    """
    try:
        # Coin'i bul
        coin_match = re.search(r'💰\s*Coin:\s*(\w+)', message)
        if not coin_match:
            return None
        symbol = coin_match.group(1).upper()
        
        # Fiyatı bul
        price_match = re.search(r'💵\s*Fiyat:\s*([\d,.]+)\s*USDT', message)
        if not price_match:
            return None
        price_str = price_match.group(1).replace(',', '')
        price = float(price_str)
        
        # İndikatörü bul
        indicator_match = re.search(r'📊\s*İndikatör:\s*([^\n]+)', message)
        indicator = indicator_match.group(1).strip() if indicator_match else 'İndicPro'
        
        # Koşulu bul
        condition_match = re.search(r'📈\s*Koşul:\s*([^\n]+)', message)
        condition = condition_match.group(1).strip() if condition_match else None
        
        # Hedefi bul
        target_match = re.search(r'🎯\s*Hedef:\s*([\d.]+)', message)
        target = float(target_match.group(1)) if target_match else None
        
        # 24 saatlik değişimi bul
        change_match = re.search(r'📈\s*Değişim:\s*([+-]?[\d.]+)%', message)
        change_24h = float(change_match.group(1)) if change_match else None
        
        # Sinyal tipini belirle
        signal_type = 'ALERT'  # Varsayılan
        if condition:
            if 'üstüne' in condition.lower() or 'yukarı' in condition.lower():
                signal_type = 'LONG'
            elif 'altına' in condition.lower() or 'aşağı' in condition.lower():
                signal_type = 'SHORT'
        
        # SHORT/LONG bilgisine göre de belirle
        if 'SHORT' in message:
            signal_type = 'SHORT'
        elif 'LONG' in message:
            signal_type = 'LONG'
        
        # Zaman dilimlerini çıkar
        timeframes = {}
        timeframe_matches = re.findall(r'•\s*(\d+[mh]):\s*([\d.]+)', message)
        for tf, value in timeframe_matches:
            timeframes[tf] = float(value)
        
        # Metadata oluştur
        metadata = {
            'source': 'indicsigs_desktop',
            'indicator': indicator,
            'timestamp': datetime.now().isoformat()
        }
        
        if condition:
            metadata['condition'] = condition
        if target:
            metadata['target'] = target
        if change_24h is not None:
            metadata['change_24h'] = change_24h
        if timeframes:
            metadata['timeframes'] = timeframes
        
        return {
            'symbol': symbol,
            'signalType': signal_type,
            'price': price,
            'timestamp': int(datetime.now().timestamp() * 1000),  # Unix timestamp in milliseconds
            'metadata': metadata
        }
        
    except Exception as e:
        print(f"Mesaj parse hatası: {e}")
        return None


def send_to_nextjs(message):
    """
    Telegram mesajını Next.js API'ye gönderir
    
    Args:
        message (str): Telegram mesajı
        
    Returns:
        bool: Başarılı ise True
    """
    try:
        # Mesajı parse et
        signal_data = parse_signal_from_message(message)
        
        if not signal_data:
            print("⚠️  Mesaj Next.js formatına çevrilemedi")
            return False
        
        print(f"\n📤 Next.js API'ye gönderiliyor...")
        print(f"   Symbol: {signal_data['symbol']}")
        print(f"   Type: {signal_data['signalType']}")
        print(f"   Price: {signal_data['price']}")
        
        # API'ye gönder
        response = requests.post(
            NEXTJS_API_URL,
            json=signal_data,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            signal_id = result.get('signalId', result.get('signal', {}).get('id', 'unknown'))
            print(f"✅ Next.js'e kaydedildi - Signal ID: {signal_id}")
            return True
        else:
            print(f"❌ Next.js API hatası: HTTP {response.status_code}")
            print(f"   Yanıt: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Next.js server'a bağlanılamadı")
        return False
    except Exception as e:
        print(f"❌ Next.js gönderim hatası: {e}")
        return False


# Test fonksiyonu
if __name__ == "__main__":
    # Test mesajı
    test_message = """🚨 TETİKLENDİ_ETHUSDT

💰 Coin: ETHUSDT
💵 Fiyat: 3961.638 USDT
📊 İndikatör: İndicPro (Ana Çizgi)
📈 Koşul: Üstüne Çıktığında
🎯 Hedef: 75.6

📊 24 Saatlik Performans:
📈 Değişim: +3.02%

⏱ Zaman Dilimleri:
• 15m: 78.16 🔴 🔴 - - 2 SHORT
• 5m: 86.71 🔴 🔴 🔴 - - 3 SHORT
• 1m: 66.52 🔴 - - 1 SHORT"""
    
    print("=" * 60)
    print("Next.js Entegrasyon Testi")
    print("=" * 60)
    print()
    
    result = send_to_nextjs(test_message)
    
    if result:
        print("\n✅ Test başarılı!")
        print("   Sinyal Next.js'e kaydedildi")
        print("   https://indic-3m.vercel.app/signals sayfasını kontrol edin")
    else:
        print("\n❌ Test başarısız!")
        print("   API endpoint'i kontrol edin: https://indic-3m.vercel.app/api/signals")
