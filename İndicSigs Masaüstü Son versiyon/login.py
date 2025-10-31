import sys
import json
import requests
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLineEdit,
                            QPushButton, QLabel, QCheckBox, QMessageBox)
from PyQt5.QtCore import Qt, QSettings

API_URL = "http://31.210.36.47:5002"  # Backend sunucu adresi

class LoginWindow(QDialog):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("IndicSigs - Giriş")
        self.setFixedWidth(400)
        self.settings = QSettings('IndicSigs', 'Login')
        self.token = None
        self.user = None
        
        # UI Setup
        layout = QVBoxLayout()
        
        # Email
        email_layout = QVBoxLayout()
        email_label = QLabel("Email:")
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Email adresiniz")
        email_layout.addWidget(email_label)
        email_layout.addWidget(self.email_input)
        
        # Password
        password_layout = QVBoxLayout()
        password_label = QLabel("Şifre:")
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Şifreniz")
        self.password_input.setEchoMode(QLineEdit.Password)
        password_layout.addWidget(password_label)
        password_layout.addWidget(self.password_input)
        
        # Remember me
        remember_layout = QHBoxLayout()
        self.remember_checkbox = QCheckBox("Beni Hatırla")
        remember_layout.addWidget(self.remember_checkbox)
        remember_layout.addStretch()
        
        # Login button
        self.login_button = QPushButton("Giriş Yap")
        self.login_button.clicked.connect(self.login)
        
        # Add all to main layout
        layout.addLayout(email_layout)
        layout.addLayout(password_layout)
        layout.addLayout(remember_layout)
        layout.addWidget(self.login_button)
        
        self.setLayout(layout)
        
        # Dark theme
        self.setStyleSheet("""
            QDialog {
                background-color: #1a1a1a;
                color: white;
            }
            QLabel {
                color: white;
                font-size: 14px;
            }
            QLineEdit {
                background-color: #2d2d2d;
                color: white;
                border: 1px solid #3d3d3d;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
            }
            QCheckBox {
                color: white;
                font-size: 14px;
            }
            QPushButton {
                background-color: #2962ff;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1e88e5;
            }
            QPushButton:pressed {
                background-color: #1976d2;
            }
        """)
        
        # Load saved credentials
        self.load_credentials()
    
    def load_credentials(self):
        """Kaydedilmiş kullanıcı bilgilerini yükle"""
        if self.settings.value('remember_me', False, type=bool):
            self.email_input.setText(self.settings.value('email', ''))
            self.password_input.setText(self.settings.value('password', ''))
            self.remember_checkbox.setChecked(True)
    
    def save_credentials(self):
        """Kullanıcı bilgilerini kaydet"""
        if self.remember_checkbox.isChecked():
            self.settings.setValue('email', self.email_input.text())
            self.settings.setValue('password', self.password_input.text())
            self.settings.setValue('remember_me', True)
        else:
            self.settings.remove('email')
            self.settings.remove('password')
            self.settings.setValue('remember_me', False)
    
    def login(self):
        """Login işlemini gerçekleştir"""
        email = self.email_input.text()
        password = self.password_input.text()
        
        if not email or not password:
            QMessageBox.warning(self, "Hata", "Email ve şifre alanları boş bırakılamaz!")
            return
            
        # Test için geçici olarak:
        if email == "admin" and password == "admin":
            self.token = "test_token"
            self.user = {"id": 1, "email": email}
            self.save_credentials()
            self.accept()
            return
        
        try:
            response = requests.post(
                f"{API_URL}/api/auth/login",
                json={
                    "email": email,
                    "password": password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user = data.get('user')
                self.save_credentials()
                self.accept()
            else:
                QMessageBox.warning(self, "Hata", "Giriş başarısız! Email veya şifre hatalı.")
        
        except Exception as e:
            QMessageBox.warning(self, "Hata", f"Bağlantı hatası: {str(e)}")
    
    def get_user_data(self):
        """Token ve kullanıcı bilgilerini döndür"""
        return self.token, self.user
