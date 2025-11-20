#!/bin/bash

echo "=========================================="
echo "Website Desa Sei Rotan - Quick Start"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  File .env tidak ditemukan!"
    echo "📝 Membuat .env dari .env.example..."
    cp .env.example .env
    echo "✅ File .env berhasil dibuat"
    echo ""
    echo "⚠️  PENTING: Edit file .env dan ganti nilai berikut untuk production:"
    echo "   - JWT_SECRET"
    echo "   - POSTGRES_PASSWORD"
    echo "   - SUPERADMIN_DEFAULT_PASSWORD"
    echo ""
    read -p "Tekan Enter untuk melanjutkan..."
fi

echo "🧹 Membersihkan containers lama..."
docker compose down

echo ""
echo "🏗️  Building dan starting containers..."
docker compose up --build -d

echo ""
echo "⏳ Menunggu services ready..."
sleep 10

echo ""
echo "📊 Status containers:"
docker compose ps

echo ""
echo "=========================================="
echo "✅ Aplikasi berhasil dijalankan!"
echo "=========================================="
echo ""
echo "🌐 Akses aplikasi di:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo ""
echo "👤 Login Admin:"
echo "   Username: superadmin"
echo "   Password: (lihat SUPERADMIN_DEFAULT_PASSWORD di .env)"
echo ""
echo "📝 Useful commands:"
echo "   docker compose logs -f          # Lihat semua logs"
echo "   docker compose logs -f backend  # Lihat logs backend"
echo "   docker compose ps               # Status containers"
echo "   docker compose down             # Stop semua"
echo ""
echo "❓ Troubleshooting: Lihat TROUBLESHOOTING.md"
echo "=========================================="
