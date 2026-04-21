#!/bin/bash

# İş Takip Sunucu Başlatma Scripti
cd "$(dirname "$0")"

echo "🚀 İş Takip Sunucuları Başlatılıyor..."
echo ""

# Eski processleri temizle
echo "🧹 Eski processler temizleniyor..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3020 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 2

# Log klasörü oluştur
mkdir -p logs

# PM2 ile başlat
echo "▶️  PM2 ile sunucular başlatılıyor..."
npx pm2 start ecosystem.config.js

echo ""
echo "✅ Sunucular başlatıldı!"
echo ""
echo "📊 Durum kontrolü:"
sleep 3
npx pm2 status

echo ""
echo "🔗 Erişim Bilgileri:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3020"
echo ""
echo "📋 Kullanışlı Komutlar:"
echo "   Durum görüntüle:  npx pm2 status"
echo "   Logları izle:     npx pm2 logs"
echo "   Restart:          npx pm2 restart all"
echo "   Durdur:           npx pm2 stop all"
echo ""
