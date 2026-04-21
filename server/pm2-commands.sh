#!/bin/bash

# İş Takip Backend PM2 Yönetim Scripti

case "$1" in
  start)
    echo "🚀 Backend başlatılıyor..."
    cd "$(dirname "$0")"
    pm2 start ecosystem.config.js
    ;;
  stop)
    echo "🛑 Backend durduruluyor..."
    pm2 stop istakip-backend
    ;;
  restart)
    echo "🔄 Backend yeniden başlatılıyor..."
    pm2 restart istakip-backend
    ;;
  status)
    echo "📊 Backend durumu:"
    pm2 status istakip-backend
    ;;
  logs)
    echo "📜 Loglar görüntüleniyor (Ctrl+C ile çıkın):"
    pm2 logs istakip-backend
    ;;
  monit)
    echo "📈 Monitör modu (Ctrl+C ile çıkın):"
    pm2 monit
    ;;
  startup)
    echo "⚙️ Otomatik başlatma ayarlanıyor..."
    pm2 startup
    pm2 save
    echo "✅ Sunucu yeniden başladığında otomatik çalışacak!"
    ;;
  *)
    echo "Kullanım: ./pm2-commands.sh [start|stop|restart|status|logs|monit|startup]"
    echo ""
    echo "Komutlar:"
    echo "  start    - Backend'i başlat"
    echo "  stop     - Backend'i durdur"
    echo "  restart  - Backend'i yeniden başlat"
    echo "  status   - Durumu kontrol et"
    echo "  logs     - Logları görüntüle"
    echo "  monit    - Monitör modu"
    echo "  startup  - Otomatik başlatma ayarla"
    ;;
esac
