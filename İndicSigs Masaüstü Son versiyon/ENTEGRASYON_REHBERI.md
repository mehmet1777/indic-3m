# 🔗 İndicSigs - Next.js Entegrasyon Rehberi

## 📋 Yapılacaklar

İndicSigs programınız Telegram'a mesaj gönderirken aynı anda Next.js API'nize de gönderecek.

## 🛠️ Adım 1: main.py Dosyasını Düzenleyin

### 1.1 Import Ekleyin

`main.py` dosyasının en üstüne, diğer import'ların yanına ekleyin:

```python
# Diğer import'ların altına ekleyin
from nextjs_integration import send_to_nextjs
```

### 1.2 send_notification Fonksiyonunu Bulun

`main.py` dosyasında `send_notification` fonksiyonunu bulun (yaklaşık 500-600. satırlar arası).

Şu şekilde görünüyor olmalı:

```python
def send_notification(self, message):
    """Hem Telegram hem web sitesine bildirim gönder"""
    try:
        # BTC analizini al
        btc_report = self.get_btc_analysis()
        
        # ... (diğer kodlar)
        
        # Bildirimleri gönder
        self.send_telegram_message(enhanced_message)
        self.send_web_notification(enhanced_message)
    except Exception as e:
        print(f"Bildirim gönderme hatası: {str(e)}")
        # Hata durumunda orijinal mesajı gönder
        self.send_telegram_message(message)
        self.send_web_notification(message)
```

### 1.3 Next.js Entegrasyonunu Ekleyin

`send_notification` fonksiyonunu şu şekilde güncelleyin:

```python
def send_notification(self, message):
    """Hem Telegram hem web sitesine bildirim gönder"""
    try:
        # BTC analizini al
        btc_report = self.get_btc_analysis()
        
        # "Zaman Dilimleri:" ve "Not:" arasına BTC raporunu ekle
        if "⏱ Zaman Dilimleri:" in message and "📝 Not:" in message:
            parts = message.split("📝 Not:")
            time_parts = parts[0].split("⏱ Zaman Dilimleri:")
            enhanced_message = time_parts[0] + "⏱ Zaman Dilimleri:" + time_parts[1] + "\n\n" + btc_report + "\n\n📝 Not:" + parts[1]
        else:
            enhanced_message = message + "\n\n" + btc_report
        
        # Bildirimleri gönder
        self.send_telegram_message(enhanced_message)
        self.send_web_notification(enhanced_message)
        
        # ✨ YENİ: Next.js API'ye gönder
        send_to_nextjs(enhanced_message)
        
    except Exception as e:
        print(f"Bildirim gönderme hatası: {str(e)}")
        # Hata durumunda orijinal mesajı gönder
        self.send_telegram_message(message)
        self.send_web_notification(message)
        
        # ✨ YENİ: Hata durumunda da Next.js'e göndermeyi dene
        try:
            send_to_nextjs(message)
        except:
            pass
```

## 🧪 Adım 2: Test Edin

### 2.1 Next.js Server'ı Başlatın

```bash
cd crypto-chart-viewer
npm run dev
```

Server'ın çalıştığını kontrol edin: https://indic-3m.vercel.app

### 2.2 Entegrasyon Modülünü Test Edin

```bash
cd "İndicSigs Masaüstü Son versiyon"
python nextjs_integration.py
```

Şu çıktıyı görmelisiniz:

```
============================================================
Next.js Entegrasyon Testi
============================================================

📤 Next.js API'ye gönderiliyor...
   Symbol: ETHUSDT
   Type: SELL
   Price: 3961.638
✅ Next.js'e kaydedildi - Signal ID: signal-xxx

✅ Test başarılı!
   Sinyal Next.js'e kaydedildi
   https://indic-3m.vercel.app/signals sayfasını kontrol edin
```

### 2.3 İndicSigs Programını Çalıştırın

```bash
python main.py
```

Artık program bir sinyal tetiklediğinde:
1. ✅ Telegram'a gönderilecek
2. ✅ Web sitenize gönderilecek
3. ✅ Next.js'e kaydedilecek
4. ✅ "Gelen Sinyaller" sayfasında görünecek

## 🔧 Adım 3: Production Ayarları

### 3.1 API URL'ini Değiştirin

`nextjs_integration.py` dosyasını açın ve URL'i güncelleyin:

```python
# Local test için
NEXTJS_API_URL = "http://localhost:3000/api/signals"

# Production için (Vercel'e deploy ettikten sonra)
NEXTJS_API_URL = "https://indic-3m.vercel.app/api/signals"
```

### 3.2 Hata Yönetimi

Eğer Next.js server çalışmıyorsa, program yine de Telegram'a mesaj gönderecek. Next.js entegrasyonu opsiyoneldir ve ana işleyişi engellemez.

## 📊 Adım 4: Kontrol Edin

### Başarılı Entegrasyon Kontrolü:

1. ✅ İndicSigs'de bir alarm tetiklenir
2. ✅ Console'da şu mesajı görürsünüz:
   ```
   📤 Next.js API'ye gönderiliyor...
      Symbol: BTCUSDT
      Type: BUY
      Price: 45000
   ✅ Next.js'e kaydedildi - Signal ID: signal-xxx
   ```
3. ✅ Telegram grubunda mesaj görünür
4. ✅ https://indic-3m.vercel.app/signals sayfasında sinyal görünür
5. ✅ Otomatik screenshot alınır (browser açıksa)

## 🐛 Sorun Giderme

### "Next.js server'a bağlanılamadı"

- Next.js server'ın çalıştığından emin olun: `npm run dev`
- Port 3000'in açık olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### "Mesaj Next.js formatına çevrilemedi"

- Telegram mesaj formatınız değişmiş olabilir
- `nextjs_integration.py` dosyasındaki `parse_signal_from_message` fonksiyonunu kontrol edin
- Debug için test script'i çalıştırın: `python nextjs_integration.py`

### Sinyaller Next.js'e gitmiyor ama Telegram'a gidiyor

- `main.py` dosyasında `send_to_nextjs(enhanced_message)` satırının eklendiğinden emin olun
- Console'da hata mesajlarını kontrol edin
- Import'un doğru olduğundan emin olun: `from nextjs_integration import send_to_nextjs`

## 💡 İpuçları

1. **Test Edin**: Önce `nextjs_integration.py` test script'i ile test edin
2. **Logları İzleyin**: Console'da Next.js gönderim loglarını takip edin
3. **Yedek Alın**: `main.py` dosyasını düzenlemeden önce yedek alın
4. **Opsiyonel**: Next.js entegrasyonu başarısız olsa bile Telegram mesajları gönderilmeye devam eder

## ✅ Özet

```
İndicSigs Alarm Tetiklenir
         ↓
send_notification() çağrılır
         ↓
    ┌────┴────┬────────────┬──────────────┐
    ↓         ↓            ↓              ↓
Telegram   Web Site   Next.js API   Console Log
    ↓         ↓            ↓              ↓
  Grup    Bildirim   Gelen Sinyaller   Debug
```

Artık tüm sinyaller otomatik olarak Next.js uygulamanıza kaydedilecek! 🎉
