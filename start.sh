#!/bin/bash

echo "🚀 İş Takip Platformu Başlatılıyor..."

# Backend'i başlat
echo "📊 Backend başlatılıyor..."
cd /Users/tureks/Desktop/Istakip/server
node test-server.js &
BACKEND_PID=$!

# 3 saniye bekle
sleep 3

# Client'i başlat
echo "🌐 Frontend başlatılıyor..."
cd /Users/tureks/Desktop/Istakip/client
npm run dev &
FRONTEND_PID=$!

echo "✅ Her iki server da başlatıldı!"
echo "📊 Backend: http://localhost:3010"
echo "🌐 Frontend: http://localhost:3001"
echo ""
echo "Durdurmak için: Ctrl+C"

# Bekle
wait
