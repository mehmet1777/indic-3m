import re

# main.py dosyasını oku
with open('./İndicSigs Masaüstü Son versiyon/main.py', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# send_notification fonksiyonunu bul
for i, line in enumerate(lines):
    if 'def send_notification' in line or 'def send_telegram_message' in line:
        print(f"Satır {i+1}: {line}")
        # Fonksiyonun devamını göster
        for j in range(i, min(i+30, len(lines))):
            print(f"{j+1}: {lines[j]}")
        print("\n" + "="*60 + "\n")
