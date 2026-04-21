# İş Takip ve Kurumsal İşbirliği Platformu

Kapsamlı, kendi sunucusunda çalışan iş takip ve kurumsal işbirliği platformu.

## 🏗️ Proje Yapısı

```
istakip/
├── client/          # Next.js Frontend
├── server/          # Node.js/Express Backend
├── shared/          # Paylaşılan tipler ve yardımcı fonksiyonlar
├── docker-compose.yml
└── package.json     # Root package.json
```

## 🚀 1. Aşama: Proje İskeleti ve Veritabanı Mimarisi

### ✅ Tamamlananlar:
- [x] Klasör yapısı oluşturuldu (client, server, shared)
- [x] Docker compose ile PostgreSQL ve Redis kurulumu
- [x] Prisma şeması tasarlandı
- [x] İlişkisel veritabanı mimarisi
- [x] Temel package.json dosyaları

### 📊 Veritabanı Tabloları:
- **User**: Kullanıcı bilgileri
- **Workspace**: Çalışma alanları
- **Group**: Gruplar ve ekipler
- **Task**: Görevler ve atamalar
- **Document**: Dokümanlar ve notlar
- **Meeting**: Toplantılar
- **Message**: Mesajlaşma
- **Notification**: Bildirimler

### 🔐 Roller ve İzinler:
- **ADMIN**: Tüm yetkiler
- **MANAGER**: Grup ve görev yönetimi
- **MEMBER**: Temel erişim

## 📋 Sonraki Aşamalar

2. **Kimlik Doğrulama ve Yetkilendirme (Auth & RBAC)**
3. **İş Takip ve Doküman Modülü**
4. **Real-time Bildirim ve Hatırlatıcılar**
5. **WebRTC ile Görüntülü/Sesli Görüşme**
6. **Dosya Yönetimi ve UI Final**

## 🛠️ Kurulum

```bash
# Docker ile veritabanını başlat
docker-compose up -d

# Server dependencies
cd server && npm install

# Client dependencies  
cd ../client && npm install

# Veritabanını senkronize et
cd ../server && npx prisma db push

# Geliştirme modunu başlat
cd .. && npm run dev
```

## 📝 Notlar

- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Frontend: localhost:3000
- Backend: localhost:3001
