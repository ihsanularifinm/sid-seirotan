# Troubleshooting Guide

## Backend Error: "relation users does not exist"

### Penyebab:
Database migrations belum dijalankan saat backend start.

### Solusi:
1. **Pastikan file `.env` di root sudah benar:**
   ```env
   POSTGRES_DB=sid_sei_rotan_db
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=password123
   JWT_SECRET=your_secret_key_min_32_chars
   SUPERADMIN_DEFAULT_PASSWORD=admin123
   ```

2. **Rebuild dan restart containers:**
   ```bash
   docker compose down -v  # Hapus volumes lama
   docker compose up --build
   ```

3. **Cek logs backend:**
   ```bash
   docker compose logs backend
   ```
   
   Seharusnya muncul:
   ```
   Database connection established
   Running database migrations...
   Database migrations completed
   ```

## Backend Terus Restart

### Cek logs:
```bash
docker compose logs backend | tail -50
```

### Kemungkinan masalah:

1. **Database belum ready:**
   - Tunggu beberapa detik, backend akan retry otomatis
   - Cek status: `docker compose ps`

2. **Environment variables salah:**
   - Pastikan `.env` di root ada dan benar
   - Jangan gunakan `localhost` untuk `DB_HOST` di Docker (gunakan `db`)

3. **Port conflict:**
   ```bash
   # Cek port yang digunakan
   docker compose ps
   netstat -tulpn | grep 8080
   ```

## Database Connection Failed

### Cek database status:
```bash
docker compose ps db
docker compose logs db
```

### Test koneksi manual:
```bash
docker compose exec db psql -U admin -d sid_sei_rotan_db
```

## Frontend Tidak Bisa Connect ke Backend

### Error: POST /api/api/v1/... 404 (Double /api)

**Penyebab:** `NEXT_PUBLIC_API_URL` salah dikonfigurasi dengan `/api` di akhir.

**Solusi:**
```env
# ❌ SALAH - Jangan tambahkan /api
NEXT_PUBLIC_API_URL=https://seirotan.desa.id/api

# ✅ BENAR - Nginx akan handle routing /api
NEXT_PUBLIC_API_URL=https://seirotan.desa.id
```

Setelah edit `.env`:
```bash
docker compose down
docker compose up --build -d
```

### Cek CORS settings:
File `.env` di root:
```env
ALLOWED_ORIGINS=http://localhost,http://localhost:3000
```

### Cek API URL di frontend:
```env
# Local development
NEXT_PUBLIC_API_URL=http://localhost

# Production
NEXT_PUBLIC_API_URL=https://seirotan.desa.id
```

## Reset Database Completely

```bash
# Stop semua containers
docker compose down

# Hapus volumes (WARNING: Data akan hilang!)
docker volume rm sid-seirotan_postgres_data

# Start ulang
docker compose up --build
```

## Useful Commands

```bash
# Lihat semua containers
docker compose ps

# Lihat logs semua services
docker compose logs

# Lihat logs specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Restart specific service
docker compose restart backend

# Rebuild specific service
docker compose up --build backend

# Masuk ke container
docker compose exec backend sh
docker compose exec db psql -U admin -d sid_sei_rotan_db

# Cek environment variables di container
docker compose exec backend env
```

## Production Deployment Checklist

- [ ] Ganti `JWT_SECRET` dengan random string minimal 32 karakter
- [ ] Ganti `POSTGRES_PASSWORD` dengan password yang kuat
- [ ] Ganti `SUPERADMIN_DEFAULT_PASSWORD` dengan password yang kuat
- [ ] Update `ALLOWED_ORIGINS` dengan domain production
- [ ] Update `NEXT_PUBLIC_API_URL` dengan URL production
- [ ] Setup HTTPS dengan SSL certificate
- [ ] Enable firewall dan tutup port yang tidak perlu
- [ ] Setup backup database otomatis
- [ ] Setup monitoring dan logging
