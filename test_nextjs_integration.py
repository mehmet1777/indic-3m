import sys
sys.path.append('./İndicSigs Masaüstü Son versiyon')

from nextjs_integration import send_to_nextjs

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
    print("   http://localhost:3000/signals sayfasını kontrol edin")
else:
    print("\n❌ Test başarısız!")
    print("   Next.js server çalışıyor mu kontrol edin")
