# Deployment Guide - Ubuntu Server

## Prerequisites

1. **Ubuntu Server** (20.04 atau lebih baru)
2. **Docker & Docker Compose** terinstall
3. **Git** terinstall

## Instalasi Docker (jika belum ada)

```bash
# Update package list
sudo apt update

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group (agar tidak perlu sudo)
sudo usermod -aG docker $USER

# Logout dan login kembali agar perubahan group berlaku
```

## Deployment Steps

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/ihsanularifinm/sid-seirotan.git
cd sid-seirotan
```

### 2. Setup Environment

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan editor favorit
nano .env
```

**PENTING - Ganti nilai berikut di `.env`:**

```env
# Database - Gunakan password yang kuat!
POSTGRES_PASSWORD=your_strong_password_here

# JWT Secret - Minimal 32 karakter random
JWT_SECRET=your_random_jwt_secret_min_32_chars_here

# Superadmin Password
# CATATAN: Jika password mengandung $, escape dengan $$ (double dollar)
# Contoh: Pa$word123 harus ditulis Pa$$word123
SUPERADMIN_DEFAULT_PASSWORD=your_admin_password_here

# Production URLs (sesuaikan dengan domain Anda)
# PENTING: Jangan tambahkan /api di NEXT_PUBLIC_API_URL (nginx handle routing)
NEXT_PUBLIC_API_URL=https://seirotan.desa.id
ALLOWED_ORIGINS=https://seirotan.desa.id
```

**Generate JWT Secret yang aman:**
```bash
openssl rand -base64 32
```

### 3. Build dan Start

```bash
# Build dan start semua containers
docker compose up --build -d

# Cek status
docker compose ps

# Lihat logs
docker compose logs -f
```

### 4. Verifikasi

```bash
# Cek apakah backend running
curl http://localhost:8080/api/v1/posts

# Cek apakah frontend running
curl http://localhost:3000
```

## Konfigurasi Nginx Reverse Proxy (Optional)

Jika ingin menggunakan domain dan HTTPS:

### 1. Install Nginx

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/seirotan
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name seirotan.desa.id;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/seirotan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL dengan Let's Encrypt

```bash
sudo certbot --nginx -d seirotan.desa.id
```

## Maintenance Commands

### Update Aplikasi

```bash
cd ~/sid-seirotan
git pull
docker compose down
docker compose up --build -d
```

### Backup Database

```bash
# Backup
docker compose exec db pg_dump -U admin sid_sei_rotan_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker compose exec -T db psql -U admin sid_sei_rotan_db < backup_20250120_120000.sql
```

### View Logs

```bash
# Semua logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend

# Database only
docker compose logs -f db
```

### Restart Services

```bash
# Restart semua
docker compose restart

# Restart backend saja
docker compose restart backend

# Restart frontend saja
docker compose restart frontend
```

### Stop Aplikasi

```bash
# Stop tanpa hapus data
docker compose down

# Stop dan hapus semua data (WARNING!)
docker compose down -v
```

## Monitoring

### Cek Resource Usage

```bash
# CPU & Memory usage
docker stats

# Disk usage
docker system df
```

### Auto-restart on Boot

```bash
# Edit docker-compose.yml, pastikan semua services punya:
restart: always

# Atau enable Docker service
sudo systemctl enable docker
```

## Troubleshooting

### Backend Error: "relation users does not exist"

```bash
# Stop semua
docker compose down -v

# Start ulang (akan create tables otomatis)
docker compose up --build -d

# Cek logs
docker compose logs backend
```

### Port Already in Use

```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3000

# Kill process yang menggunakan port
sudo kill -9 <PID>
```

### Database Connection Failed

```bash
# Cek database logs
docker compose logs db

# Masuk ke database manual
docker compose exec db psql -U admin sid_sei_rotan_db

# Test koneksi
docker compose exec backend sh
# Dalam container:
env | grep DB_
```

### Out of Disk Space

```bash
# Cleanup unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a
```

## Security Checklist

- [ ] Ganti semua default passwords di `.env`
- [ ] Setup firewall (UFW)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Setup SSL/HTTPS dengan Let's Encrypt
- [ ] Disable root SSH login
- [ ] Setup automatic security updates
- [ ] Configure database backup cron job
- [ ] Setup monitoring (optional: Prometheus, Grafana)
- [ ] Configure log rotation

## Backup Strategy

### Automated Daily Backup

```bash
# Create backup script
nano ~/backup-db.sh
```

Isi dengan:

```bash
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
cd ~/sid-seirotan
docker compose exec -T db pg_dump -U admin sid_sei_rotan_db | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/ubuntuserver/backup-db.sh
```

## Performance Tuning

### PostgreSQL

Edit `docker-compose.yml`, tambahkan di service `db`:

```yaml
command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Nginx Caching

Tambahkan di nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... rest of config
}
```

## Support

Jika ada masalah, cek:
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Logs: `docker compose logs -f`
3. GitHub Issues: https://github.com/ihsanularifinm/sid-seirotan/issues
