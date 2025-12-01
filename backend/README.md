# Backend - Website Desa

Backend ini dibangun menggunakan Go dengan framework Gin untuk website desa yang dapat dikustomisasi.

## Teknologi

-   **Go:** Bahasa pemrograman utama
-   **Gin:** Framework web untuk routing dan middleware
-   **GORM:** ORM untuk interaksi dengan database
-   **PostgreSQL:** Database relasional
-   **JWT (JSON Web Tokens):** Untuk autentikasi stateless
-   **golang-migrate:** Untuk migrasi database

## Struktur Folder

-   `/config`: Konfigurasi database
-   `/db/migrations`: File migrasi SQL
-   `/db/seeds`: Script SQL untuk data awal (seed data)
-   `/handlers`: Logika bisnis untuk setiap endpoint
-   `/middlewares`: Middleware untuk autentikasi dan otorisasi
-   `/models`: Definisi struct untuk tabel database
-   `/repositories`: Abstraksi untuk akses data ke database
-   `/routes`: Definisi semua rute API
-   `/uploads`: Direktori untuk menyimpan file yang diunggah

## Menjalankan Backend

### Menggunakan Docker (Disarankan)

Lihat panduan di README utama untuk menjalankan aplikasi menggunakan Docker Compose.

### Manual (Development)

1.  Pastikan Anda sudah membuat file `.env` (lihat README utama).
2.  Jalankan migrasi database (lihat README utama).
3.  Dari direktori `backend`, jalankan:
    ```bash
    go run main.go
    ```

## Seed Data

Untuk mengisi database dengan data awal (hero sliders dan site settings), jalankan script seed:

```bash
# Menggunakan psql
psql -U your_username -d your_database -f backend/db/seeds/seed_hero_sliders_and_settings.sql

# Atau menggunakan Docker
docker exec -i your_postgres_container psql -U your_username -d your_database < backend/db/seeds/seed_hero_sliders_and_settings.sql
```

Lihat dokumentasi lengkap di `backend/db/seeds/README.md`.

## API Endpoints

API di-prefix dengan `/api/v1`.

### Publik

-   `GET /posts`: Mendapatkan semua berita (dengan paginasi)
-   `GET /posts/slug/:slug`: Mendapatkan detail berita berdasarkan slug
-   `GET /officials`: Mendapatkan semua aparatur desa
-   `GET /potentials`: Mendapatkan semua potensi desa
-   `GET /hero-sliders`: Mendapatkan hero sliders aktif
-   `GET /settings`: Mendapatkan semua site settings
-   `GET /settings/:group`: Mendapatkan settings berdasarkan group
-   `POST /contacts`: Mengirim pesan kontak

### Admin (Membutuhkan Autentikasi)

-   `POST /admin/login`: Login untuk mendapatkan token JWT
-   `POST /admin/upload`: Mengunggah file
-   Manajemen CRUD untuk Berita, Aparatur Desa, Layanan, Potensi, Pengguna, Hero Sliders, dan Site Settings.
