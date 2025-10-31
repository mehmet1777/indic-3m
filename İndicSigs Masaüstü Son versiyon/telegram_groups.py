from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QPushButton, 
                            QLabel, QLineEdit, QTableWidget, QTableWidgetItem, QMessageBox)
from PyQt5.QtCore import Qt
import json

class TelegramGroupsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.parent = parent
        self.setWindowTitle("Telegram Grupları")
        self.setModal(True)
        self.setMinimumWidth(500)
        
        layout = QVBoxLayout(self)
        
        # Input alanları
        input_layout = QVBoxLayout()
        
        # Grup adı
        name_layout = QHBoxLayout()
        name_label = QLabel("Grup Adı:")
        self.group_name_input = QLineEdit()
        name_layout.addWidget(name_label)
        name_layout.addWidget(self.group_name_input)
        input_layout.addLayout(name_layout)
        
        # Grup ID
        id_layout = QHBoxLayout()
        id_label = QLabel("Grup ID:")
        self.group_id_input = QLineEdit()
        id_layout.addWidget(id_label)
        id_layout.addWidget(self.group_id_input)
        input_layout.addLayout(id_layout)
        
        # Coin
        coin_layout = QHBoxLayout()
        coin_label = QLabel("Coin:")
        self.coin_input = QLineEdit()
        coin_label.setToolTip("Özel bir coin için BTCUSDT gibi girin, tüm coinler için ALL yazın")
        self.coin_input.setToolTip("Özel bir coin için BTCUSDT gibi girin, tüm coinler için ALL yazın")
        coin_layout.addWidget(coin_label)
        coin_layout.addWidget(self.coin_input)
        input_layout.addLayout(coin_layout)
        
        layout.addLayout(input_layout)
        
        # Gruplar tablosu
        self.groups_table = QTableWidget()
        self.groups_table.setColumnCount(3)
        self.groups_table.setHorizontalHeaderLabels(["Grup Adı", "Grup ID", "Coin"])
        self.groups_table.horizontalHeader().setStretchLastSection(True)
        layout.addWidget(self.groups_table)
        
        # Butonlar
        button_layout = QHBoxLayout()
        
        self.add_button = QPushButton("Yeni Grup Ekle")
        self.add_button.clicked.connect(self.add_group)
        
        self.delete_button = QPushButton("Seçili Grubu Sil")
        self.delete_button.clicked.connect(self.delete_selected_group)
        
        self.test_button = QPushButton("Seçili Grubu Test Et")
        self.test_button.clicked.connect(self.test_selected_group)
        
        button_layout.addWidget(self.add_button)
        button_layout.addWidget(self.delete_button)
        button_layout.addWidget(self.test_button)
        
        layout.addLayout(button_layout)
        
        # Dark theme
        self.setStyleSheet("""
            QDialog {
                background-color: #1a1a1a;
                color: white;
            }
            QLabel {
                color: white;
            }
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                padding: 5px;
            }
            QTableWidget {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                border-radius: 4px;
                gridline-color: #3d3d3d;
            }
            QTableWidget::item {
                color: white;
            }
            QHeaderView::section {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
            }
            QPushButton {
                background-color: #2962ff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #1e88e5;
            }
            QPushButton:pressed {
                background-color: #1976d2;
            }
        """)
        
        # Mevcut grupları yükle
        self.load_groups()
    
    def load_groups(self):
        """Kayıtlı grupları yükle"""
        try:
            with open(self.parent.settings_file, "r") as f:
                settings = json.load(f)
                groups = settings.get("telegram_groups", [])
                
                self.groups_table.setRowCount(0)
                for group in groups:
                    row = self.groups_table.rowCount()
                    self.groups_table.insertRow(row)
                    self.groups_table.setItem(row, 0, QTableWidgetItem(group["name"]))
                    self.groups_table.setItem(row, 1, QTableWidgetItem(group["chat_id"]))
                    self.groups_table.setItem(row, 2, QTableWidgetItem(group["coins"]))
        except Exception as e:
            print(f"Gruplar yüklenirken hata: {e}")
    
    def save_groups(self):
        """Grupları kaydet"""
        try:
            groups = []
            for row in range(self.groups_table.rowCount()):
                group = {
                    "name": self.groups_table.item(row, 0).text(),
                    "chat_id": self.groups_table.item(row, 1).text(),
                    "coins": self.groups_table.item(row, 2).text()
                }
                groups.append(group)
            
            # Ayarları yükle ve güncelle
            with open(self.parent.settings_file, "r") as f:
                settings = json.load(f)
            
            settings["telegram_groups"] = groups
            
            # Ayarları kaydet
            with open(self.parent.settings_file, "w") as f:
                json.dump(settings, f, indent=4)
        except Exception as e:
            print(f"Gruplar kaydedilirken hata: {e}")
    
    def add_group(self):
        name = self.group_name_input.text().strip()
        chat_id = self.group_id_input.text().strip()
        coin = self.coin_input.text().strip().upper()  # Coin adını büyük harfe çevir
        
        if name and chat_id and coin:
            try:
                # Chat ID formatını düzelt
                # Önce tüm tire ve boşlukları temizle
                clean_id = chat_id.replace('-', '').replace(' ', '')
                
                if not clean_id.isdigit():
                    QMessageBox.warning(self, "Hata", "Grup ID'si sadece sayılardan oluşmalıdır!")
                    return
                    
                # ID'yi doğru formata getir
                if not clean_id.startswith('100'):
                    chat_id = f"-100{clean_id}"
                else:
                    chat_id = f"-{clean_id}"
                
                print(f"Düzenlenen Chat ID: {chat_id}")  # Debug için
                
                row = self.groups_table.rowCount()
                self.groups_table.insertRow(row)
                self.groups_table.setItem(row, 0, QTableWidgetItem(name))
                self.groups_table.setItem(row, 1, QTableWidgetItem(chat_id))
                self.groups_table.setItem(row, 2, QTableWidgetItem(coin))
                
                self.save_groups()
                
                # Input alanlarını temizle
                self.group_name_input.clear()
                self.group_id_input.clear()
                self.coin_input.clear()
                
                # Değişiklikleri hemen uygula
                if self.parent:
                    self.parent.load_settings()
                    self.parent.setup_telegram_bot()
                    
                    # Hemen test et
                    success, message = self.parent.test_telegram_group(chat_id)
                    if not success:
                        QMessageBox.warning(self, "Uyarı", 
                            f"Grup eklendi ama test başarısız oldu!\n\n"
                            f"Lütfen şunları kontrol edin:\n"
                            f"1. Bot gruba eklenmiş mi?\n"
                            f"2. Bot'un yönetici yetkileri var mı?\n"
                            f"3. Grup ID'si doğru mu?\n\n"
                            f"Hata: {message}")
                    
            except Exception as e:
                QMessageBox.warning(self, "Hata", f"Grup eklenirken hata oluştu: {str(e)}")
                
    def delete_selected_group(self):
        current_row = self.groups_table.currentRow()
        if current_row >= 0:
            self.groups_table.removeRow(current_row)
            self.save_groups()
            
    def test_selected_group(self):
        """Seçili grubu test et"""
        selected_items = self.groups_table.selectedItems()
        if not selected_items:
            QMessageBox.warning(self, "Uyarı", "Lütfen test edilecek bir grup seçin!")
            return
            
        try:
            chat_id = self.groups_table.item(selected_items[0].row(), 1).text()
            success, message = self.parent.test_telegram_group(chat_id)
            
            if success:
                QMessageBox.information(self, "Başarılı", message)
            else:
                QMessageBox.warning(self, "Hata", message)
                
        except Exception as e:
            QMessageBox.warning(self, "Hata", f"Test sırasında bir hata oluştu: {str(e)}")
