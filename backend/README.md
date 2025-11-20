# Backend - Website Desa Sei Rotan

Backend ini dibangun menggunakan Go dengan framework Gin.

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

## API Endpoints

API di-prefix dengan `/api/v1`.

### Publik

-   `GET /posts`: Mendapatkan semua berita (dengan paginasi)
-   `GET /posts/slug/:slug`: Mendapatkan detail berita berdasarkan slug
-   `GET /officials`: Mendapatkan semua aparatur desa
-   `GET /potentials`: Mendapatkan semua potensi desa
-   `POST /contacts`: Mengirim pesan kontak

### Admin (Membutuhkan Autentikasi)

-   `POST /admin/login`: Login untuk mendapatkan token JWT
-   `POST /admin/upload`: Mengunggah file
-   Manajemen CRUD untuk Berita, Aparatur Desa, Layanan, Potensi, dan Pengguna.
