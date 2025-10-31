"""
Next.js API Konfigürasyonu

Bu dosyayı düzenleyerek API URL'ini değiştirebilirsiniz.
"""

# Local test için
NEXTJS_API_URL_LOCAL = "https://indic-3m.vercel.app/signals"

# Production için (Vercel'e deploy ettikten sonra buraya yazın)
NEXTJS_API_URL_PRODUCTION = "https://indic-3m.vercel.app/signals"

# Hangi ortamı kullanacağınızı seçin
USE_PRODUCTION = False  # True yapın production'a geçmek için

# Aktif URL
NEXTJS_API_URL = NEXTJS_API_URL_PRODUCTION if USE_PRODUCTION else NEXTJS_API_URL_LOCAL
