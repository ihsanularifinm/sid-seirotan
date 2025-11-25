# Database Migrations

## Overview
Database migrations untuk Sistem Informasi Desa (SID) Seirotan menggunakan GORM Auto-Migration dan SQL migration files untuk production.

## Migration Files

### 000001_create_initial_tables.up.sql
Initial database schema dengan semua core tables:
- `users` - User management (superadmin, admin, author)
- `news` - Berita/artikel desa
- `village_officials` - Aparatur desa dengan support hamlet
- `services` - Layanan desa
- `potentials` - Potensi desa
- `contacts` - Pesan kontak dari masyarakat
- `hero_sliders` - Hero slider homepage
- `site_settings` - Konfigurasi website
- `page_views` - Analytics tracking

**Features:**
- Soft deletes (`deleted_at`)
- Timestamps (`created_at`, `updated_at`)
- Proper indexes untuk performance
- Foreign key constraints

### Hamlet Support (Built-in)
Aparatur desa mendukung sistem dusun yang fleksibel:

**Use Cases:**
1. **Numeric hamlets**: `hamlet_number=1, hamlet_name=NULL` → Display: "Dusun I"
2. **Pemekaran**: `hamlet_number=9, hamlet_name="IX-A"` → Display: "Dusun IX-A"
3. **Named hamlets**: `hamlet_number=NULL, hamlet_name="Makmur"` → Display: "Dusun Makmur"
4. **No hamlet**: Both NULL → Display: "Aparatur Desa"

## Running Migrations

### Development (Recommended)
Backend otomatis menjalankan GORM Auto-Migration saat startup via `config.InitDB()`.

```bash
cd backend
go run main.go
```

GORM akan:
- Create tables jika belum ada
- Add columns baru jika ada perubahan model
- **TIDAK** akan drop columns atau tables

### Production (Manual SQL)

#### Via Docker:
```bash
# Connect ke database container
docker exec -it sid-seirotan-db-1 psql -U postgres -d sid_seirotan

# Run migration
\i /docker-entrypoint-initdb.d/000001_create_initial_tables.up.sql
```

#### Via psql langsung:
```bash
psql -U postgres -d sid_seirotan -f backend/db/migrations/000001_create_initial_tables.up.sql
```

#### Via migrate CLI:
```bash
cd backend
migrate -path db/migrations -database "postgresql://postgres:password@localhost:5432/sid_seirotan?sslmode=disable" up
```

## Verification

### Check Tables
```sql
-- List all tables
\dt

-- Check specific table structure
\d users
\d village_officials
\d hero_sliders
\d site_settings
```

### Check Data
```sql
-- Check default users
SELECT id, username, role FROM users;

-- Check settings
SELECT setting_key, setting_group FROM site_settings;

-- Check hero sliders
SELECT id, title, is_active FROM hero_sliders;
```

## Rollback

⚠️ **Warning:** Rollback akan menghapus semua data!

### Drop All Tables
```sql
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS hero_sliders CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS potentials CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS village_officials CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Using migrate CLI
```bash
migrate -path db/migrations -database "postgresql://postgres:password@localhost:5432/sid_seirotan?sslmode=disable" down
```

## Seeding Data

Setelah migration, jalankan seed data:

```bash
# Via script
cd seeds
./test_seed_data.sh

# Atau manual via psql
psql -U postgres -d sid_seirotan -f seeds/seed_hero_sliders_and_settings.sql
```

Seed data includes:
- Default superadmin user
- Default admin user  
- Site settings (general, social, profile)
- Default hero slider

## Troubleshooting

### "relation already exists"
Tables sudah ada, skip migration atau drop tables dulu.

### "column already exists"
GORM sudah add column, aman untuk diabaikan.

### Permission denied
Pastikan user postgres punya permission:
```sql
GRANT ALL PRIVILEGES ON DATABASE sid_seirotan TO postgres;
```

### Connection refused
Pastikan database container running:
```bash
docker ps | grep postgres
docker-compose up -d db
```

## Notes

- **Development**: Gunakan GORM Auto-Migration (otomatis)
- **Production**: Gunakan SQL migration files (manual control)
- **Backup**: Selalu backup database sebelum migration di production
- **Testing**: Test migration di staging environment dulu
