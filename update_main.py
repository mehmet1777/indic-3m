"""
main.py dosyasını günceller - Next.js entegrasyonunu ekler
"""

# main.py dosyasını oku
with open('./İndicSigs Masaüstü Son versiyon/main.py', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# 1. Import ekle (en üste)
import_line = "from nextjs_integration import send_to_nextjs"
import_added = False

# import telegram satırını bul ve hemen altına ekle
for i, line in enumerate(lines):
    if 'import telegram' in line and not import_added:
        lines.insert(i + 1, import_line)
        import_added = True
        print(f"✅ Import eklendi (satır {i+2})")
        break

# 2. send_notification fonksiyonunu güncelle
for i, line in enumerate(lines):
    if line.strip() == 'self.send_web_notification(enhanced_message)':
        # Bu satırdan sonra Next.js çağrısını ekle
        indent = len(line) - len(line.lstrip())
        nextjs_call = ' ' * indent + 'send_to_nextjs(enhanced_message)  # Next.js API\'ye gönder'
        lines.insert(i + 1, nextjs_call)
        print(f"✅ Next.js çağrısı eklendi (satır {i+2}) - enhanced_message için")
        break

# 3. Hata durumu için de ekle
for i, line in enumerate(lines):
    if line.strip() == 'self.send_web_notification(message)' and 'Hata durumunda' in lines[i-2]:
        # Bu satırdan sonra Next.js çağrısını ekle
        indent = len(line) - len(line.lstrip())
        nextjs_call = ' ' * indent + 'send_to_nextjs(message)  # Next.js API\'ye gönder'
        lines.insert(i + 1, nextjs_call)
        print(f"✅ Next.js çağrısı eklendi (satır {i+2}) - hata durumu için")
        break

# Güncellenmiş içeriği yaz
updated_content = '\n'.join(lines)

# Yedek al
with open('./İndicSigs Masaüstü Son versiyon/main.py.backup', 'w', encoding='utf-8') as f:
    with open('./İndicSigs Masaüstü Son versiyon/main.py', 'r', encoding='utf-8') as original:
        f.write(original.read())
print("✅ Yedek oluşturuldu: main.py.backup")

# Güncellenmiş dosyayı yaz
with open('./İndicSigs Masaüstü Son versiyon/main.py', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("\n" + "="*60)
print("✅ main.py başarıyla güncellendi!")
print("="*60)
print("\nYapılan değişiklikler:")
print("1. ✅ 'from nextjs_integration import send_to_nextjs' import'u eklendi")
print("2. ✅ send_notification() fonksiyonuna Next.js çağrısı eklendi")
print("3. ✅ Hata durumu için de Next.js çağrısı eklendi")
print("\nYedek dosya: main.py.backup")
print("\nŞimdi İndicSigs programını çalıştırıp test edebilirsiniz!")
