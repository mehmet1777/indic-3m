import os
import json

class UserSettings:
    def __init__(self, email):
        """Her kullanıcı için ayrı ayarlar oluştur"""
        self.email = email
        self.user_dir = os.path.join("users", email.replace("@", "_").replace(".", "_"))
        os.makedirs(self.user_dir, exist_ok=True)
        
        # Dosya yolları
        self.settings_file = os.path.join(self.user_dir, "settings.json")
        self.coins_file = os.path.join(self.user_dir, "saved_coins.json")
        self.alarms_file = os.path.join(self.user_dir, "alarms.json")
        
        # Varsayılan dosyaları oluştur
        self._create_default_files()
    
    def _create_default_files(self):
        """Varsayılan dosyaları oluştur"""
        if not os.path.exists(self.settings_file):
            self.save_settings({
                "telegram_token": "",
                "telegram_enabled": False,
                "web_notifications_enabled": False,
                "telegram_groups": []
            })
            
        if not os.path.exists(self.coins_file):
            self.save_coins([])
            
        if not os.path.exists(self.alarms_file):
            self.save_alarms([])
    
    def load_settings(self):
        """Kullanıcı ayarlarını yükle"""
        try:
            with open(self.settings_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Ayarlar yüklenirken hata: {e}")
            return {}
    
    def save_settings(self, settings):
        """Kullanıcı ayarlarını kaydet"""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=4)
        except Exception as e:
            print(f"Ayarlar kaydedilirken hata: {e}")
    
    def load_saved_coins(self):
        """Kaydedilmiş coinleri yükle"""
        try:
            with open(self.coins_file, 'r') as f:
                data = json.load(f)
                return data.get('coins', [])
        except Exception as e:
            print(f"Coinler yüklenirken hata: {e}")
            return []
    
    def save_coins(self, coins):
        """Coinleri kaydet"""
        try:
            with open(self.coins_file, 'w') as f:
                json.dump({'coins': coins}, f, indent=4)
        except Exception as e:
            print(f"Coinler kaydedilirken hata: {e}")
    
    def load_alarms(self):
        """Alarmları yükle"""
        try:
            with open(self.alarms_file, 'r') as f:
                data = json.load(f)
                return data.get('alarms', [])
        except Exception as e:
            print(f"Alarmlar yüklenirken hata: {e}")
            return []
    
    def save_alarms(self, alarms):
        """Alarmları kaydet"""
        try:
            with open(self.alarms_file, 'w') as f:
                json.dump({'alarms': alarms}, f, indent=4)
        except Exception as e:
            print(f"Alarmlar kaydedilirken hata: {e}")
